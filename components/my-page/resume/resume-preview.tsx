'use client';

import React from 'react';
import { ResumeDataResponse } from '@/types/resume/resume';

export default function ResumePreview({ data }: { data: ResumeDataResponse }) {
  const profileImageUrl = data.resume_image?.[0];

  const getEnrollmentState = (enrolled?: string) => {
    if (enrolled === 'enrolled') return ' / 현재 재학중';
    if (enrolled === 'graduated') return ' / 졸업';
    if (enrolled === 'etc') return ' / 그 외(졸업예정, 휴학, 자퇴 등)';
    return '';
  };

  const getEmploymentState = (employed?: boolean) => {
    if (employed) return ' / 현재 재직중';
    return '';
  };

  return (
    <div className="text-gray-800 text-sm leading-6 pb-5">
      {/* 프로필 이미지 */}
      {profileImageUrl && (
        <div className="mb-4">
          <img
            src={profileImageUrl}
            alt="resume_image"
            className="w-24 h-24 object-cover rounded-md"
          />
        </div>
      )}

      {/* 제목 */}
      <h1 className="text-xl font-bold mb-2">{data.title}</h1>

      {/* 기본 정보 */}
      <div className="mb-4">
        <p className="mb-1">이름 : {data.name}</p>
        <p className="mb-1">연락처 : {data.phone}</p>
        <p className="mb-1">이메일 : {data.email}</p>
      </div>

      {/* 간단 소개 */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">간단 소개</h2>
        <div
          className="mb-2"
          dangerouslySetInnerHTML={{ __html: data.introduction }}
        />
      </div>

      {/* 학력 */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">학력</h2>
        {data.education.map((edu, index) => (
          <div key={`edu-${index}`} className="mb-2">
            {edu.schoolName} - {edu.majorAndDegree} ({edu.startDate} ~{' '}
            {edu.endDate}
            {getEnrollmentState(edu.isCurrentlyEnrolled)})
            <hr className="my-2 border-gray-300" />
          </div>
        ))}
      </div>

      {/* 경력 */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">경력</h2>
        {data.experience.map((exp, index) => (
          <div key={`exp-${index}`} className="mb-4">
            <p className="mb-1">
              {exp.companyName} - {exp.jobTitle} ({exp.startDate} ~{' '}
              {exp.endDate}
              {getEmploymentState(exp.isCurrentlyEmployed)})
            </p>
            <p className="mb-1">{exp.description}</p>
            <hr className="my-2 border-gray-300" />
          </div>
        ))}
      </div>

      {/* 자격사항 */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">자격사항</h2>

        {data.certificates.map((cert, index) => (
          <p key={`cert-${index}`} className="mb-1">
            - {cert.certificateName} ({cert.date})
          </p>
        ))}
      </div>

      {/* 수상경력/활동 */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">수상 경력 및 활동</h2>

        {data.awards.map((award, index) => (
          <p key={`award-${index}`} className="mb-1">
            - {award.awardName} ({award.date})
          </p>
        ))}
      </div>

      {/* 링크 */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">링크</h2>

        {data.links.map((link, index) => (
          <p key={`link-${index}`} className="mb-1">
            - {link.url} ({link.title})
          </p>
        ))}
      </div>
    </div>
  );
}
