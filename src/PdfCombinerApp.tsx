import React, { useState } from 'react';
import { PDFDocument, PDFPage } from 'pdf-lib';
import { useDropzone } from 'react-dropzone';
import styled, { createGlobalStyle } from 'styled-components';


const GlobalStyle = createGlobalStyle`
  body {
  
    background-color: #3498db;
  
`;

const Container = styled.div`
  text-align: center;
  max-width: 600px;
  margin: auto;
  padding: 20px;
  background: white; /* Gradient background */
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2); /* Increased box shadow */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 90vh;
  color: gray; /* Text color */
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Dropzone = styled.div`
  border: 2px dashed #7e8a97;
  padding: 20px;
  cursor: pointer;
  transition: border 0.3s ease;

  &:hover {
    border: 2px dashed #3498db;
  }
`;

const FileList = styled.div`
  margin-top: 20px;
  text-align: left;
`;

const FileItem = styled.li`
  margin-bottom: 8px;
  list-style: none;
`;

const Button = styled.button`
  background-color: #3498db;
  color: white;
  padding: 12px 24px;
  margin-top: 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #2980b9;
  }
`;

const DownloadButton = styled(Button)`
  margin-top: 0;
`;

const PdfCombinerApp: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [mergedPdf, setMergedPdf] = useState<Uint8Array | null>(null);

  const onDrop = (acceptedFiles: File[]) => {
    setFiles([...files, ...acceptedFiles]);
  };

  const mergePDFs = async () => {
    if (files.length < 2) {
      alert('Please select at least 2 PDF files to merge.');
      return;
    }

    const mergedDocument = await PDFDocument.create();

    for (const file of files) {
      const pdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedDocument.copyPages(pdfDoc, pdfDoc.getPageIndices());
      copiedPages.forEach((page: PDFPage) => {
        mergedDocument.addPage(page);
      });
    }

    const mergedPdfBytes = await mergedDocument.save();
    setMergedPdf(mergedPdfBytes);
  };

  const handleDownload = () => {
    if (mergedPdf) {
      const blob = new Blob([mergedPdf], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <>
      <GlobalStyle />
      <Container>
        <h1 style={{ color: '#3498db' }}>PDF Combiner</h1>
        <Dropzone {...getRootProps()}>
          <input {...getInputProps()} />
          <p style={{ color: '#7e8a97' }}>Drag and drop PDF files here, or click to select files</p>
        </Dropzone>
        {files.length > 0 && (
          <div>
            <h2 style={{ color: '#3498db' }}>Selected Files:</h2>
            <FileList>
              {files.map((file, index) => (
                <FileItem key={index}>{file.name}</FileItem>
              ))}
            </FileList>
            <Button onClick={mergePDFs}>Merge Files</Button>
          </div>
        )}
        {mergedPdf && (
          <div>
            <h2 style={{ color: '#3498db' }}>Download Merged PDF</h2>
            <DownloadButton onClick={handleDownload}>Download</DownloadButton>
          </div>
        )}
      </Container>
    </>
  );
};


export default PdfCombinerApp;