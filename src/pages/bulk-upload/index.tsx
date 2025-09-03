import { Icon } from "@/components/icon";
import { useStudents } from "@/hooks/useStudents";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Alert, AlertDescription } from "@/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { Textarea } from "@/ui/textarea";
import { Badge } from "@/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "@/routes/hooks";

interface ParsedStudent {
  name: string;
  roll_number: string;
  email?: string;
  class?: string;
  section?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
  value?: string;
}

export default function BulkUpload() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inputText, setInputText] = useState("");
  const [parsedData, setParsedData] = useState<ParsedStudent[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("text");
  
  const { bulkUpload, isBulkUploading, students } = useStudents();

  // Template data for copying
  const templateText = `name,roll_number,email,class,section
Ahmed Hassan,ROLL001,ahmed@school.edu,10,A
Fatima Ali,ROLL002,fatima@school.edu,10,A
Muhammad Khan,ROLL003,,10,B
Sara Ahmed,ROLL004,sara@school.edu,11,A
Ali Raza,ROLL005,,11,B`;

  const copyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(templateText);
      toast.success("Template copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy template");
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([templateText], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'students_template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
    toast.success("Template file downloaded!");
  };

  const parseCommaSeparatedText = (text: string): ParsedStudent[] => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      const student: any = {};
      
      headers.forEach((header, i) => {
        student[header] = values[i] || '';
      });
      
      return {
        name: student.name || '',
        roll_number: student.roll_number || '',
        email: student.email?.trim() || undefined, // Make email truly optional
        class: student.class || '',
        section: student.section || '',
      };
    }).filter(student => student.name || student.roll_number); // Filter out completely empty rows
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const text = await file.text();
      const parsed = parseCommaSeparatedText(text);
      
      if (parsed.length === 0) {
        toast.error("No valid student data found in the file. Please check the format.");
        setIsProcessing(false);
        return;
      }

      setParsedData(parsed);
      const errors = validateStudents(parsed);
      setValidationErrors(errors);
      
      if (errors.length === 0) {
        toast.success(`${parsed.length} students ready to upload from file`);
      } else {
        toast.warning(`Found ${errors.length} validation errors in the file that need to be fixed`);
      }
    } catch (error) {
      toast.error('Failed to parse CSV file. Please check the format.');
      setParsedData([]);
      setValidationErrors([]);
    }
    
    setIsProcessing(false);
  };

  const validateStudents = (studentsData: ParsedStudent[]): ValidationError[] => {
    const errors: ValidationError[] = [];
    const existingRollNumbers = new Set((students || []).map(s => s.roll_number));
    const seenRollNumbers = new Set<string>();
    
    studentsData.forEach((student, index) => {
      const row = index + 2; // +2 because we skip header and use 1-based indexing
      
      // Required fields
      if (!student.name?.trim()) {
        errors.push({ row, field: 'name', message: 'Name is required', value: student.name });
      }
      if (!student.roll_number?.trim()) {
        errors.push({ row, field: 'roll_number', message: 'Roll number is required', value: student.roll_number });
      }
      
      // Duplicate check within CSV
      if (student.roll_number?.trim()) {
        if (seenRollNumbers.has(student.roll_number)) {
          errors.push({ row, field: 'roll_number', message: 'Duplicate roll number in data', value: student.roll_number });
        }
        seenRollNumbers.add(student.roll_number);
      }
      
      // Check against existing database records
      if (existingRollNumbers.has(student.roll_number)) {
        errors.push({ row, field: 'roll_number', message: 'Roll number already exists in database', value: student.roll_number });
      }
      
      // Email validation (only if provided)
      if (student.email?.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(student.email)) {
          errors.push({ row, field: 'email', message: 'Invalid email format', value: student.email });
        }
      }
    });
    
    return errors;
  };

  const handleProcessData = () => {
    if (!inputText.trim()) {
      toast.error("Please enter student data");
      return;
    }

    setIsProcessing(true);
    
    try {
      const parsed = parseCommaSeparatedText(inputText);
      if (parsed.length === 0) {
        toast.error("No valid student data found. Please check the format.");
        setIsProcessing(false);
        return;
      }

      setParsedData(parsed);
      const errors = validateStudents(parsed);
      setValidationErrors(errors);
      
      if (errors.length === 0) {
        toast.success(`${parsed.length} students ready to upload`);
      } else {
        toast.warning(`Found ${errors.length} validation errors that need to be fixed`);
      }
    } catch (error) {
      toast.error("Failed to parse student data. Please check the format.");
      setParsedData([]);
      setValidationErrors([]);
    }
    
    setIsProcessing(false);
  };

  const handleUpload = async () => {
    if (validationErrors.length > 0) {
      toast.error('Please fix all validation errors before uploading');
      return;
    }
    
    if (parsedData.length === 0) {
      toast.error('No students to upload');
      return;
    }
    
    try {
      await bulkUpload({ students: parsedData });
      toast.success(`Successfully uploaded ${parsedData.length} students`);
      clearData();
      router.push('/students');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload students');
    }
  };

  const clearData = () => {
    setInputText("");
    setParsedData([]);
    setValidationErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getRowError = (rowIndex: number, field: string) => {
    return validationErrors.find(e => e.row === rowIndex + 2 && e.field === field);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/students")}>
          <Icon icon="solar:arrow-left-outline" className="w-4 h-4 mr-2" />
          Back to Students
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Bulk Upload Students</h1>
          <p className="text-muted-foreground mt-1">
            Add multiple students using comma-separated format
          </p>
        </div>
      </div>

      {/* Instructions & Template */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Icon icon="solar:info-circle-outline" className="w-5 h-5 text-blue-600" />
              Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">1</div>
                <div>
                  <p className="font-medium">Use comma-separated format</p>
                  <p className="text-muted-foreground">First line should be headers, followed by student data</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">2</div>
                <div>
                  <p className="font-medium">Required fields</p>
                  <p className="text-muted-foreground">name, roll_number (must be unique)</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">3</div>
                <div>
                  <p className="font-medium">Optional fields</p>
                  <p className="text-muted-foreground">email, class, section (leave email empty if not available)</p>
                </div>
              </div>
            </div>
            
            <Alert>
              <Icon icon="solar:shield-check-outline" className="h-4 w-4" />
              <AlertDescription>
                Voting IDs will be automatically generated for each student. 
                Make sure roll numbers are unique.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Icon icon="solar:copy-outline" className="w-5 h-5 text-green-600" />
              Template
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg font-mono text-xs overflow-x-auto">
              <div className="whitespace-pre-wrap text-gray-700">{templateText}</div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={copyTemplate} variant="outline" className="flex-1">
                <Icon icon="solar:copy-outline" className="w-4 h-4 mr-2" />
                Copy Template
              </Button>
              <Button onClick={downloadTemplate} variant="outline" className="flex-1">
                <Icon icon="solar:download-outline" className="w-4 h-4 mr-2" />
                Download CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="solar:upload-outline" className="w-5 h-5" />
            Upload Student Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <Icon icon="solar:pen-new-square-outline" className="w-4 h-4" />
                Text Input
              </TabsTrigger>
              <TabsTrigger value="file" className="flex items-center gap-2">
                <Icon icon="solar:document-outline" className="w-4 h-4" />
                File Upload
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4">
              <div className="space-y-3">
                <Textarea
                  placeholder="Paste or type your student data here in comma-separated format...

Example:
name,roll_number,email,class,section
Ahmed Hassan,ROLL001,ahmed@school.edu,10,A
Fatima Ali,ROLL002,fatima@school.edu,10,A
Sara Ahmed,ROLL003,,11,B"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                  disabled={isProcessing || isBulkUploading}
                />
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {inputText.trim() ? `${inputText.trim().split('\n').length - 1} lines of data` : 'No data entered'}
                  </div>
                  
                  <div className="flex gap-2">
                    {inputText.trim() && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setInputText("")}
                        disabled={isProcessing || isBulkUploading}
                      >
                        Clear
                      </Button>
                    )}
                    <Button
                      onClick={handleProcessData}
                      disabled={!inputText.trim() || isProcessing || isBulkUploading}
                    >
                      {isProcessing && <Icon icon="solar:refresh-outline" className="w-4 h-4 mr-2 animate-spin" />}
                      Process Data
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="file" className="space-y-4">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Icon icon="solar:cloud-upload-outline" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <h3 className="font-medium">Upload CSV File</h3>
                    <p className="text-sm text-muted-foreground">
                      Select a CSV file with student data
                    </p>
                  </div>
                  
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing || isBulkUploading}
                    className="mt-4"
                  >
                    <Icon icon="solar:folder-outline" className="w-4 h-4 mr-2" />
                    Choose CSV File
                  </Button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
                
                {isProcessing && (
                  <div className="text-center">
                    <Icon icon="solar:refresh-outline" className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Processing file...</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <Icon icon="solar:danger-outline" className="w-5 h-5" />
              Validation Errors ({validationErrors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {validationErrors.map((error, index) => (
                <div key={index} className="flex items-start gap-3 text-sm p-3 bg-red-50 border border-red-200 rounded-lg">
                  <Icon icon="solar:close-circle-outline" className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-red-800">
                      Row {error.row}, {error.field}
                    </div>
                    <div className="text-red-600">
                      {error.message}
                      {error.value && (
                        <span className="text-red-500"> (value: "{error.value}")</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview and Upload */}
      {parsedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon icon="solar:eye-outline" className="w-5 h-5" />
                Preview Data ({parsedData.length} students)
              </div>
              <div className="flex items-center gap-3">
                {validationErrors.length === 0 ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <Icon icon="solar:check-circle-outline" className="w-3 h-3 mr-1" />
                    Ready to upload
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <Icon icon="solar:close-circle-outline" className="w-3 h-3 mr-1" />
                    {validationErrors.length} errors
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.slice(0, 10).map((student, index) => (
                    <TableRow key={index}>
                      <TableCell className={getRowError(index, 'name') ? 'bg-red-50' : ''}>
                        {student.name || <span className="text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell className={getRowError(index, 'roll_number') ? 'bg-red-50' : ''}>
                        {student.roll_number || <span className="text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell>{student.class || <span className="text-muted-foreground">-</span>}</TableCell>
                      <TableCell>{student.section || <span className="text-muted-foreground">-</span>}</TableCell>
                      <TableCell className={getRowError(index, 'email') ? 'bg-red-50' : ''}>
                        {student.email || <span className="text-muted-foreground">-</span>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {parsedData.length > 10 && (
              <p className="text-sm text-muted-foreground text-center">
                Showing first 10 of {parsedData.length} students
              </p>
            )}
            
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={clearData}
                disabled={isBulkUploading}
              >
                Clear All
              </Button>
              <Button
                onClick={handleUpload}
                disabled={validationErrors.length > 0 || isBulkUploading}
                className="min-w-[150px]"
              >
                {isBulkUploading && <Icon icon="solar:refresh-outline" className="w-4 h-4 mr-2 animate-spin" />}
                {isBulkUploading ? 'Uploading...' : `Upload ${parsedData.length} Students`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}