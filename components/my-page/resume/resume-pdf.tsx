import Image from 'next/image';
import {
  Page,
  Text,
  Font,
  View,
  Document,
  StyleSheet,
  PDFDownloadLink,
  Image as PDFImage,
} from '@react-pdf/renderer';
import { ResumeDataResponse } from '@/types/resume/resume';
import ReactHtmlParser from 'react-html-parser';
import React from 'react';

Font.register({
  family: 'PretendardMedium',
  src: '/fonts/PretendardMedium.ttf',
});

const pdfStyles = StyleSheet.create({
  page: { flexDirection: 'column', backgroundColor: '#ffffff' },
  section: { margin: 10, padding: 10, flexGrow: 1 },
  text: {
    fontFamily: 'PretendardMedium',
    fontSize: 12,
  },
});

const ResumePDF = ({ data }: { data: ResumeDataResponse }) => {
  const renderHtmlToPdf = (html: string) => {
    return ReactHtmlParser(html, {
      transform: (node: any, index: number) => {
        if (node.type === 'tag' && node.name === 'p') {
          return (
            <Text key={`p-${index}`} style={pdfStyles.text}>
              {node.children[0]?.data}
            </Text>
          );
        }
        if (node.type === 'tag' && node.name === 'strong') {
          return (
            <Text key={`strong-${index}`} style={{ ...pdfStyles.text }}>
              {node.children[0]?.data}
            </Text>
          );
        }
      },
    });
  };

  const convertImageToBase64 = async (url: string) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  return (
    <PDFDownloadLink
      document={
        <Document>
          <Page size="A4" style={pdfStyles.page}>
            <View style={pdfStyles.section}>
              {data.resume_image[0] && (
                <PDFImage
                  src={convertImageToBase64(data.resume_image[0])}
                  style={{ width: 100, height: 100 }}
                />
              )}
              <Text style={pdfStyles.text}>{data.title}</Text>
              <Text style={pdfStyles.text}>{data.name}</Text>
              <Text style={pdfStyles.text}>{data.email}</Text>
              <Text style={pdfStyles.text}>{data.phone}</Text>
              {renderHtmlToPdf(data.introduction)}
            </View>

            <View style={pdfStyles.section}>
              <Text style={pdfStyles.text}>학력</Text>
              {data.education.map((edu, index) => (
                <React.Fragment key={`edu-${index}`}>
                  <Text style={pdfStyles.text}>
                    {edu.schoolName} - {edu.majorAndDegree} ({edu.startDate} -{' '}
                    {edu.endDate})
                  </Text>
                  <Text style={pdfStyles.text}>
                    {edu.isCurrentlyEnrolled === 'enrolled'
                      ? '현재 재학중'
                      : edu.isCurrentlyEnrolled === 'graduated'
                        ? '졸업'
                        : edu.isCurrentlyEnrolled === 'etc'
                          ? '그 외(졸업예정, 휴학, 자퇴 등)'
                          : ''}
                  </Text>
                </React.Fragment>
              ))}
            </View>

            <View style={pdfStyles.section}>
              <Text style={pdfStyles.text}>경력</Text>
              {data.experience.map((exp, index) => (
                <React.Fragment key={`exp-${index}`}>
                  <Text style={pdfStyles.text}>
                    {exp.companyName} - {exp.jobTitle} ({exp.startDate} -{' '}
                    {exp.endDate})
                  </Text>

                  <Text style={pdfStyles.text}>{exp.description}</Text>
                  <Text style={pdfStyles.text}>
                    {exp.isCurrentlyEmployed === true ? '현재 재직중' : ''}
                  </Text>
                </React.Fragment>
              ))}
            </View>

            <View style={pdfStyles.section}>
              <Text style={pdfStyles.text}>자격사항</Text>
              {data.certificates.map((cert, index) => (
                <Text key={`cert-${index}`} style={pdfStyles.text}>
                  {cert.certificateName} ({cert.date})
                </Text>
              ))}
            </View>

            <View style={pdfStyles.section}>
              <Text style={pdfStyles.text}>수상 경력 및 활동</Text>
              {data.awards.map((award, index) => (
                <Text key={`award-${index}`} style={pdfStyles.text}>
                  {award.awardName} ({award.date})
                </Text>
              ))}
            </View>

            <View style={pdfStyles.section}>
              <Text style={pdfStyles.text}>링크</Text>
              {data.links.map((link, index) => (
                <Text key={`link-${index}`} style={pdfStyles.text}>
                  {link.url} ({link.title})
                </Text>
              ))}
            </View>
          </Page>
        </Document>
      }
      fileName="example.pdf"
    >
      <div className="flex items-center justify-center gap-2 py-2 border-b">
        <p className="text-sm">다운로드</p>

        <div className="relative w-[15px] h-[15px]">
          <Image src="/svg/download.svg" alt="download" fill />
        </div>
      </div>
    </PDFDownloadLink>
  );
};

export default ResumePDF;
