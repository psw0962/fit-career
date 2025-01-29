import {
  Page,
  Text,
  Font,
  View,
  Document,
  StyleSheet,
  Image as PDFImage,
} from '@react-pdf/renderer';
import { ResumeDataResponse } from '@/types/resume/resume';
import parse from 'html-react-parser';
import * as React from 'react';

Font.register({
  family: 'PretendardMedium',
  src: '/fonts/PretendardMedium.ttf',
  fontWeight: 'normal',
  fontStyle: 'normal',
});

Font.register({
  family: 'PretendardMedium-fallback',
  src: '/fonts/PretendardMedium-fallback.ttf',
  fontWeight: 'normal',
  fontStyle: 'normal',
});

const pdfStyles = StyleSheet.create({
  page: { flexDirection: 'column', backgroundColor: '#ffffff' },
  section: { margin: 10 },
  divier: {
    marginTop: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  titleText: {
    fontFamily: 'PretendardMedium',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subTitleText: {
    fontFamily: 'PretendardMedium',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
  },
  text: {
    fontFamily: 'PretendardMedium',
    fontSize: 12,
    fontWeight: 'medium',
    marginTop: 2,
    marginBottom: 2,
  },
});

const ResumeDocument = ({ data }: { data: ResumeDataResponse }) => {
  function renderHtmlToPdf(html: string | null) {
    if (!html) return <Text style={pdfStyles.text}>소개 내용이 없습니다.</Text>;

    return parse(html, {
      replace: (domNode) => {
        if (!domNode || domNode.type !== 'tag') return null;

        if (domNode.name === 'div') {
          return domNode.children?.map((child, index) => {
            if (child.type === 'tag') {
              return (
                <React.Fragment key={index}>
                  {renderHtmlToPdf(child.toString())}
                </React.Fragment>
              );
            }
            return null;
          });
        }

        if (domNode.name === 'p') {
          const textContent = domNode.children
            ?.map((child) => (child.type === 'text' ? child.data : ''))
            .join(' ')
            .trim();

          return textContent ? (
            <Text style={pdfStyles.text}>{textContent}</Text>
          ) : null;
        }

        return null;
      },
    });
  }

  const convertImageToBase64 = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      // if (blob.size > 1024 * 1024) {
      //   throw new Error('Image size too large');
      // }

      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = (error) => {
          console.error('Image conversion error:', error);
          reject(error);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Failed to convert image:', error);
      return '';
    }
  };

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.section}>
          {data.resume_image[0] && (
            <PDFImage
              src={convertImageToBase64(data.resume_image[0])}
              style={{
                width: 100,
                height: 100,
                borderRadius: 10,
                objectFit: 'cover',
              }}
            />
          )}
        </View>

        <View style={pdfStyles.section}>
          <Text style={pdfStyles.titleText}>{data.title}</Text>
        </View>

        <View style={pdfStyles.section}>
          <Text style={pdfStyles.text}>이름 : {data.name}</Text>
          <Text style={pdfStyles.text}>연락처 : {data.phone}</Text>
          <Text style={pdfStyles.text}>이메일 : {data.email}</Text>
        </View>

        <View style={pdfStyles.section}>
          <Text style={pdfStyles.subTitleText}>간단 소개</Text>

          {renderHtmlToPdf(data.introduction)}
        </View>

        <View style={pdfStyles.section}>
          <Text style={pdfStyles.subTitleText}>학력</Text>

          {data.education.map((edu, index) => (
            <React.Fragment key={`edu-${index}`}>
              <Text style={pdfStyles.text}>
                {edu.schoolName} - {edu.majorAndDegree} ({edu.startDate} -{' '}
                {edu.endDate}
                {edu.isCurrentlyEnrolled === 'enrolled'
                  ? ' / 현재 재학중'
                  : edu.isCurrentlyEnrolled === 'graduated'
                    ? ' / 졸업'
                    : edu.isCurrentlyEnrolled === 'etc'
                      ? ' / 그 외(졸업예정, 휴학, 자퇴 등)'
                      : ''}
                )
              </Text>

              <View style={pdfStyles.divier} />
            </React.Fragment>
          ))}
        </View>

        <View style={pdfStyles.section}>
          <Text style={pdfStyles.subTitleText}>경력</Text>

          {data.experience.map((exp, index) => (
            <React.Fragment key={`exp-${index}`}>
              <Text style={pdfStyles.text}>
                {exp.companyName} - {exp.jobTitle} ({exp.startDate} -{' '}
                {exp.endDate}
                {exp.isCurrentlyEmployed === true ? ' / 현재 재직중' : ''})
              </Text>

              <Text style={pdfStyles.text}>{exp.description}</Text>

              <View style={pdfStyles.divier} />
            </React.Fragment>
          ))}
        </View>

        <View style={pdfStyles.section}>
          <Text style={pdfStyles.subTitleText}>자격사항</Text>

          {data.certificates.map((cert, index) => (
            <Text key={`cert-${index}`} style={pdfStyles.text}>
              - {cert.certificateName} ({cert.date})
            </Text>
          ))}
        </View>

        <View style={pdfStyles.section}>
          <Text style={pdfStyles.subTitleText}>수상 경력 및 활동</Text>

          {data.awards.map((award, index) => (
            <Text key={`award-${index}`} style={pdfStyles.text}>
              - {award.awardName} ({award.date})
            </Text>
          ))}
        </View>

        <View style={pdfStyles.section}>
          <Text style={pdfStyles.subTitleText}>링크</Text>

          {data.links.map((link, index) => (
            <Text key={`link-${index}`} style={pdfStyles.text}>
              - {link.url} ({link.title})
            </Text>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default ResumeDocument;
