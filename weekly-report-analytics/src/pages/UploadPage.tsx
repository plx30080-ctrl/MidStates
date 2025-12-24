import { useState } from 'react';
import { parseWeeklyReport } from '@/lib/parseExcel';
import type { ParsedReport } from '@/lib/parseExcel';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedReport | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
      setParsedData(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      // Parse the Excel file
      const parsed = await parseWeeklyReport(file);
      setParsedData(parsed);

      // Upload file to Firebase Storage
      const storageRef = ref(storage, `reports/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Save metadata and parsed data to Firestore
      await addDoc(collection(db, 'reports'), {
        fileName: parsed.fileName,
        weekNumber: parsed.weekNumber,
        uploadDate: parsed.uploadDate,
        uploadedBy: 'system',
        fileUrl: downloadURL,
        sheets: parsed.sheets.map(sheet => ({
          sheetName: sheet.sheetName,
          weekCount: sheet.weeklyData.length,
          hasYTD: !!sheet.ytdData,
          has13WeekAvg: !!sheet.thirteenWeekAverage
        })),
        parsedData: parsed.sheets // Store full parsed data
      });

      setSuccess(true);
      setFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Upload Weekly Report</h1>
        <p className="text-slate-600">Upload a 13 Week Report Excel file to add it to the system</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileSpreadsheet className="w-5 h-5 mr-2 text-blue-600" />
            Select File
          </CardTitle>
          <CardDescription>
            Choose an Excel file (.xlsx or .xls) containing the 13 Week Report
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Input */}
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
            <input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="w-12 h-12 text-slate-400 mb-4" />
              <span className="text-sm font-medium text-slate-700 mb-1">
                Click to upload or drag and drop
              </span>
              <span className="text-xs text-slate-500">
                Excel files only (.xlsx, .xls)
              </span>
            </label>
          </div>

          {/* Selected File Info */}
          {file && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start justify-between">
              <div className="flex items-start">
                <FileSpreadsheet className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-slate-900">{file.name}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              {!uploading && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    setParsedData(null);
                  }}
                >
                  Remove
                </Button>
              )}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                File uploaded successfully! The data is now available in the dashboard.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Parsed Data Preview */}
          {parsedData && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h3 className="font-medium text-slate-900 mb-3">File Contents</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Week Number:</span>
                  <span className="font-medium text-slate-900">{parsedData.weekNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Sheets:</span>
                  <span className="font-medium text-slate-900">{parsedData.sheets.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Upload Date:</span>
                  <span className="font-medium text-slate-900">
                    {parsedData.uploadDate.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700"
          >
            {uploading ? (
              <span className="flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </span>
            ) : (
              <span className="flex items-center">
                <Upload className="w-4 h-4 mr-2" />
                Upload Report
              </span>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
