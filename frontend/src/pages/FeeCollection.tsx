import React, { useState, useEffect } from 'react';
import { useSession } from '../contexts/SessionContext';
import { useAuth } from '../contexts/AuthContext';
import { feesService } from '../services/feesService';
import type { StudentFee, Student } from '../services/feesService';
import { useToast } from '../contexts/ToastContext';
import { Search, CreditCard, User, DollarSign, FileText, PieChart, Printer, X } from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Progress from '../components/ui/Progress';

interface PaymentFormData {
  student_id: number;
  fee_type_id: number;
  amount_paid: number;
  payment_date: string;
  payment_mode: 'cash' | 'online' | 'cheque' | 'bank_transfer';
  notes: string;
  reference_no: string;
}

interface InvoiceData {
  invoice_no: string;
  date: string;
  student: {
    id: number;
    name: string;
    admission_no: string;
    class: string;
    section: string;
  };
  session: string;
  fees: Array<{
    fee_type: string;
    fee_group: string;
    amount_due: number;
    amount_paid: number;
    remaining: number;
    status: string;
    due_date?: string;
  }>;
  summary: {
    total_due: number;
    total_paid: number;
    total_remaining: number;
  };
}

interface FeeSplitData {
  student: {
    id: number;
    name: string;
    admission_no: string;
    class: string;
    section: string;
  };
  session: string;
  by_fee_group: Record<string, {
    total_due: number;
    total_paid: number;
    total_remaining: number;
    fee_types: Array<{
      name: string;
      amount_due: number;
      amount_paid: number;
      remaining: number;
      status: string;
      due_date?: string;
    }>;
  }>;
  by_status: {
    pending: number;
    partial: number;
    overdue: number;
    paid: number;
  };
  summary: {
    total_due: number;
    total_paid: number;
    total_remaining: number;
  };
}

const FeeCollection: React.FC = () => {
  const { currentSession } = useSession();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  // State management
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentFees, setStudentFees] = useState<StudentFee[]>([]);
  const [feeSplit, setFeeSplit] = useState<FeeSplitData | null>(null);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showFeeSplitModal, setShowFeeSplitModal] = useState(false);
  const [selectedStudentFee, setSelectedStudentFee] = useState<StudentFee | null>(null);
  const [classes, setClasses] = useState<Array<{ id: number; name: string }>>([]);
  const [sections, setSections] = useState<Array<{ id: number; name: string }>>([]);
  
  const [paymentForm, setPaymentForm] = useState<PaymentFormData>({
    student_id: 0,
    fee_type_id: 0,
    amount_paid: 0,
    payment_date: new Date().toISOString().split('T')[0],
    payment_mode: 'cash',
    notes: '',
    reference_no: ''
  });

  const isAdmin = user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'accountant';

  useEffect(() => {
    if (currentSession) {
      fetchClasses();
      fetchSections();
      fetchStudents();
    }
  }, [currentSession]);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentFees();
      fetchFeeSplit();
    }
  }, [selectedStudent, currentSession]);

  const fetchClasses = async () => {
    try {
      const response = await feesService.getClasses();
      if (response.success) {
        setClasses(response.data.data || response.data);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const fetchSections = async () => {
    try {
      const response = await feesService.getSections();
      if (response.success) {
        setSections(response.data.data || response.data);
      }
    } catch (error) {
      console.error('Failed to fetch sections:', error);
    }
  };

  const fetchStudents = async () => {
    if (!currentSession) return;
    
    try {
      setLoading(true);
      const response = await feesService.getStudents({
        session_id: currentSession.id,
        search: searchTerm,
        class_id: selectedClass || undefined,
        section_id: selectedSection || undefined
      });
      
      if (response.success) {
        const studentsData = response.data.data || response.data;
        setStudents(studentsData);
      }
    } catch (error: any) {
      showToast('error', 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentFees = async () => {
    if (!selectedStudent || !currentSession) return;
    
    try {
      const response = await feesService.getStudentFeeSummary(selectedStudent.id, currentSession.id);
      if (response.success) {
        const fees = response.data.fees || [];
        const feesWithComputed = fees.map((fee: StudentFee) => ({
          ...fee,
          remaining_amount: fee.amount_due - fee.amount_paid,
          payment_percentage: fee.amount_due > 0 ? Math.round((fee.amount_paid / fee.amount_due) * 100) : 0
        }));
        setStudentFees(feesWithComputed);
      }
    } catch (error: any) {
      showToast('error', 'Failed to fetch student fees');
    }
  };

  const fetchFeeSplit = async () => {
    if (!selectedStudent || !currentSession) return;
    
    try {
      const response = await feesService.getFeeSplit(selectedStudent.id, currentSession.id);
      if (response.success) {
        setFeeSplit(response.data);
      }
    } catch (error) {
      showToast('error', 'Failed to fetch fee breakdown');
    }
  };

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setShowPaymentForm(false);
    setSelectedStudentFee(null);
  };

  const handlePayment = (studentFee: StudentFee) => {
    setSelectedStudentFee(studentFee);
    setPaymentForm({
      student_id: selectedStudent!.id,
      fee_type_id: studentFee.fee_type_id,
      amount_paid: studentFee.remaining_amount || 0,
      payment_date: new Date().toISOString().split('T')[0],
      payment_mode: 'cash',
      notes: '',
      reference_no: ''
    });
    setShowPaymentForm(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentSession) {
      showToast('error', 'No active session selected');
      return;
    }

    try {
      const response = await feesService.collectFee({
        ...paymentForm,
        session_id: currentSession.id
      });
      
      if (response.success) {
        showToast('success', 'Payment collected successfully');
        setShowPaymentForm(false);
        setSelectedStudentFee(null);
        fetchStudentFees();
        fetchFeeSplit();
      }
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Failed to collect payment');
    }
  };

  const handleGenerateInvoice = async () => {
    if (!selectedStudent || !currentSession) return;
    
    try {
      const response = await feesService.generateInvoice(selectedStudent.id, currentSession.id, false);
      if (response.success) {
        setInvoice(response.data);
        setShowInvoiceModal(true);
      }
    } catch (error: any) {
      showToast('error', 'Failed to generate invoice');
    }
  };

  const handlePrintInvoice = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && invoice) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice - ${invoice.student.name}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
              .student-info { margin-bottom: 30px; }
              .fee-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              .fee-table th, .fee-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              .fee-table th { background-color: #f5f5f5; }
              .summary { text-align: right; font-weight: bold; }
              .total { font-size: 18px; color: #333; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>FEE INVOICE</h1>
              <p>Invoice No: ${invoice.invoice_no}</p>
              <p>Date: ${invoice.date}</p>
            </div>
            
            <div class="student-info">
              <h3>Student Information</h3>
              <p><strong>Name:</strong> ${invoice.student.name}</p>
              <p><strong>Admission No:</strong> ${invoice.student.admission_no}</p>
              <p><strong>Class:</strong> ${invoice.student.class}</p>
              <p><strong>Section:</strong> ${invoice.student.section}</p>
              <p><strong>Session:</strong> ${invoice.session}</p>
            </div>
            
            <table class="fee-table">
              <thead>
                <tr>
                  <th>Fee Type</th>
                  <th>Fee Group</th>
                  <th>Amount Due</th>
                  <th>Amount Paid</th>
                  <th>Remaining</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.fees.map(fee => `
                  <tr>
                    <td>${fee.fee_type}</td>
                    <td>${fee.fee_group}</td>
                    <td>₹${fee.amount_due}</td>
                    <td>₹${fee.amount_paid}</td>
                    <td>₹${fee.remaining}</td>
                    <td>${fee.status}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="summary">
              <p><strong>Total Due:</strong> ₹${invoice.summary.total_due}</p>
              <p><strong>Total Paid:</strong> ₹${invoice.summary.total_paid}</p>
              <p class="total"><strong>Total Remaining:</strong> ₹${invoice.summary.total_remaining}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.admission_no.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = !selectedClass || student.class_room?.id.toString() === selectedClass;
    const matchesSection = !selectedSection || student.section?.id.toString() === selectedSection;
    
    return matchesSearch && matchesClass && matchesSection;
  });

  if (!currentSession) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please select a session to view fee collection</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Fee Collection</h1>
          <p className="text-gray-600">Collect fee payments for {currentSession.name}</p>
        </div>
        <div className="flex gap-2">
          {selectedStudent && (
            <>
              <Button
                onClick={() => setShowFeeSplitModal(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <PieChart className="w-4 h-4" />
                Fee Breakdown
              </Button>
              <Button
                onClick={handleGenerateInvoice}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Generate Invoice
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Student Selection Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Select Student</h2>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full"
            options={[
              { value: '', label: 'All Classes' },
              ...classes.map(cls => ({ value: cls.id.toString(), label: cls.name }))
            ]}
          />
          <Select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full"
            options={[
              { value: '', label: 'All Sections' },
              ...sections.map(sec => ({ value: sec.id.toString(), label: sec.name }))
            ]}
          />
          <Button onClick={fetchStudents} className="flex items-center gap-2">
            Filter
          </Button>
        </div>

        {/* Students List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No students found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                onClick={() => handleStudentSelect(student)}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedStudent?.id === student.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 h-12 w-12">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {student.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {student.admission_no}
                    </p>
                    <p className="text-xs text-gray-400">
                      {student.class_room?.name} - {student.section?.name}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Student Fees */}
      {selectedStudent && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              Fees for {selectedStudent.name} ({selectedStudent.admission_no})
            </h2>
            <div className="text-sm text-gray-500">
              {studentFees.length} fee types assigned
            </div>
          </div>

          {studentFees.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No fees assigned to this student</p>
          ) : (
            <div className="space-y-4">
              {studentFees.map((studentFee) => (
                <div key={studentFee.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {studentFee.fee_type?.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {studentFee.fee_type?.fee_group?.name}
                      </p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(studentFee.status)}`}>
                      {studentFee.status.charAt(0).toUpperCase() + studentFee.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-500">Amount Due</p>
                      <p className="font-medium text-gray-900">₹{studentFee.amount_due}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Amount Paid</p>
                      <p className="font-medium text-gray-900">₹{studentFee.amount_paid}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Remaining</p>
                      <p className="font-medium text-gray-900">₹{studentFee.remaining_amount || 0}</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                      <span>Payment Progress</span>
                      <span>{studentFee.payment_percentage || 0}%</span>
                    </div>
                    <Progress value={studentFee.payment_percentage || 0} className="h-2" />
                  </div>

                  {studentFee.status !== 'paid' && isAdmin && (
                    <Button
                      onClick={() => handlePayment(studentFee)}
                      className="flex items-center gap-2"
                    >
                      <DollarSign className="w-4 h-4" />
                      Collect Payment
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payment Form */}
      {showPaymentForm && selectedStudentFee && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Collect Payment</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowPaymentForm(false);
                setSelectedStudentFee(null);
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
              <p className="text-sm text-gray-900">{selectedStudentFee.student?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fee Type</label>
              <p className="text-sm text-gray-900">{selectedStudentFee.fee_type?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount Due</label>
              <p className="text-sm text-gray-900">₹{selectedStudentFee.amount_due}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remaining Amount</label>
              <p className="text-sm text-gray-900">₹{selectedStudentFee.remaining_amount || 0}</p>
            </div>
          </div>
          
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount to Pay *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={selectedStudentFee.remaining_amount || 0}
                  value={paymentForm.amount_paid}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount_paid: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Date *
                </label>
                <Input
                  type="date"
                  value={paymentForm.payment_date}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Mode *
                </label>
                <Select
                  value={paymentForm.payment_mode}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_mode: e.target.value as any })}
                  required
                  options={[
                    { value: 'cash', label: 'Cash' },
                    { value: 'online', label: 'Online' },
                    { value: 'cheque', label: 'Cheque' },
                    { value: 'bank_transfer', label: 'Bank Transfer' }
                  ]}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference Number
                </label>
                <Input
                  type="text"
                  value={paymentForm.reference_no}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference_no: e.target.value })}
                  placeholder="Transaction/Cheque number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <Input
                  type="text"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  placeholder="Additional notes"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Collect Payment
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPaymentForm(false);
                  setSelectedStudentFee(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Fee Split Modal */}
      {showFeeSplitModal && feeSplit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Fee Breakdown - {feeSplit.student.name}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFeeSplitModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Summary Cards */}
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">Total Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Total Due:</span>
                        <span className="font-medium">₹{feeSplit.summary.total_due}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Total Paid:</span>
                        <span className="font-medium">₹{feeSplit.summary.total_paid}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-blue-900">Remaining:</span>
                        <span className="text-red-600">₹{feeSplit.summary.total_remaining}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Status Breakdown</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Pending:</span>
                        <span className="font-medium">₹{feeSplit.by_status.pending}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Partial:</span>
                        <span className="font-medium">₹{feeSplit.by_status.partial}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Overdue:</span>
                        <span className="font-medium text-red-600">₹{feeSplit.by_status.overdue}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Paid:</span>
                        <span className="font-medium text-green-600">₹{feeSplit.by_status.paid}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fee Group Breakdown */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Fee Group Breakdown</h3>
                  <div className="space-y-3">
                    {Object.entries(feeSplit.by_fee_group).map(([groupName, groupData]) => (
                      <div key={groupName} className="border rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-gray-900">{groupName}</h4>
                          <span className="text-sm text-gray-500">
                            ₹{groupData.total_remaining} remaining
                          </span>
                        </div>
                        <div className="space-y-1">
                          {groupData.fee_types.map((feeType, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-gray-600">{feeType.name}</span>
                              <span className={`font-medium ${
                                feeType.status === 'overdue' ? 'text-red-600' :
                                feeType.status === 'paid' ? 'text-green-600' :
                                feeType.status === 'partial' ? 'text-yellow-600' : 'text-gray-600'
                              }`}>
                                ₹{feeType.remaining}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && invoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Invoice - {invoice.student.name}</h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handlePrintInvoice}
                    className="flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Print
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowInvoiceModal(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Invoice No</p>
                    <p className="font-medium">{invoice.invoice_no}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">{invoice.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Student Name</p>
                    <p className="font-medium">{invoice.student.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Admission No</p>
                    <p className="font-medium">{invoice.student.admission_no}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Class</p>
                    <p className="font-medium">{invoice.student.class}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Section</p>
                    <p className="font-medium">{invoice.student.section}</p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fee Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fee Group
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount Due
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount Paid
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Remaining
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoice.fees.map((fee, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {fee.fee_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {fee.fee_group}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{fee.amount_due}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{fee.amount_paid}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{fee.remaining}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(fee.status)}`}>
                            {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 text-right">
                <div className="text-lg font-medium">
                  <span className="text-gray-700">Total Due: ₹{invoice.summary.total_due}</span>
                </div>
                <div className="text-lg font-medium">
                  <span className="text-gray-700">Total Paid: ₹{invoice.summary.total_paid}</span>
                </div>
                <div className="text-xl font-bold text-red-600">
                  <span>Total Remaining: ₹{invoice.summary.total_remaining}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeCollection;
