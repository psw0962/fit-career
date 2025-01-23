import Image from 'next/image';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { ResumeDataResponse } from '@/types/resume/resume';
import React, { useState } from 'react';
import ResumeDocument from '@/components/my-page/resume/resume-document';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const ResumeExport = ({
  data,
  isExport,
  isPreview,
}: {
  data: ResumeDataResponse;
  isExport?: boolean;
  isPreview?: boolean;
}) => {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <>
      {isExport && (
        <PDFDownloadLink
          document={<ResumeDocument data={data} />}
          fileName={data.title}
        >
          <div className="flex items-center justify-center gap-2 py-2 border-b">
            <p className="text-sm">다운로드</p>

            <div className="relative w-[15px] h-[15px]">
              <Image src="/svg/download.svg" alt="download" fill />
            </div>
          </div>
        </PDFDownloadLink>
      )}

      {isPreview && (
        <>
          <div
            className="flex items-center justify-center gap-2 border-b py-2 cursor-pointer"
            onClick={() => setShowPreview(true)}
          >
            <p className="text-sm">미리보기</p>
            <Image src="/svg/view.svg" alt="view" width={15} height={15} />
          </div>

          {showPreview && (
            <Dialog
              open={showPreview}
              onOpenChange={(isOpen) => !isOpen && setShowPreview(false)}
            >
              <DialogContent className="w-[90vw] min-w-[300px] h-[80vh]">
                <DialogHeader>
                  <DialogTitle></DialogTitle>
                  <DialogDescription></DialogDescription>
                </DialogHeader>

                <div className="mt-5 w-full h-full">
                  <PDFViewer width="100%" height="100%">
                    <ResumeDocument data={data} />
                  </PDFViewer>
                </div>

                <DialogFooter></DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </>
      )}
    </>
  );
};

export default ResumeExport;
