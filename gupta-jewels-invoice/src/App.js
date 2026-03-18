// import './storage';
// import React, { useState, useEffect, useCallback } from 'react';
// import { Plus, Trash2, Calculator, Save, FileText, Download, Search, X, Copy, FileSpreadsheet } from 'lucide-react';

// function App() {
//   const [invoiceNo, setInvoiceNo] = useState('12');
//   const [purchaserName, setPurchaserName] = useState('Deepak');
//   const [address, setAddress] = useState('Purani Bazazi');
//   const [contactNumber, setContactNumber] = useState('');
//   const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
//   const [paymentMethod, setPaymentMethod] = useState('Cash');
//   const [includeGST, setIncludeGST] = useState(true);
//   const [items, setItems] = useState([]);
//   const [invoiceHistory, setInvoiceHistory] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');

//   useEffect(() => {
//     loadInvoiceHistory();
//   }, []);

//   const loadInvoiceHistory = async () => {
//     try {
//       const keys = await window.storage.list('invoice:');
//       if (keys && keys.keys) {
//         const invoices = [];
//         for (const key of keys.keys) {
//           try {
//             const result = await window.storage.get(key);
//             if (result) {
//               invoices.push(JSON.parse(result.value));
//             }
//           } catch (e) {
//             console.error('Error loading invoice:', e);
//           }
//         }
//         setInvoiceHistory(invoices.sort((a, b) => new Date(b.date) - new Date(a.date)));
//       }
//     } catch (error) {
//       console.error('Error loading history:', error);
//     }
//   };

//   const addItem = () => {
//     setItems([...items, {
//       id: Date.now(),
//       description: '',
//       purity: '',
//       rate: 0,
//       weight: 0,
//       making: 0,
//       amount: 0
//     }]);
//   };

//   const removeLastItem = () => {
//     if (items.length > 0) {
//       setItems(items.slice(0, -1));
//     }
//   };

//   const updateItem = useCallback((id, field, value) => {
//     setItems(prevItems => prevItems.map(item => {
//       if (item.id === id) {
//         const updatedItem = { ...item };
//         if (field === 'description' || field === 'purity') {
//           updatedItem[field] = value;
//         } else {
//           updatedItem[field] = parseFloat(value) || 0;
//         }
//         updatedItem.amount = (updatedItem.rate + updatedItem.making) * updatedItem.weight;
//         return updatedItem;
//       }
//       return item;
//     }));
//   }, []);

//   const recalculate = () => {
//     setItems(prevItems => prevItems.map(item => ({
//       ...item,
//       amount: (item.rate + item.making) * item.weight
//     })));
//   };

//   const calculateTotals = useCallback(() => {
//     const total = items.reduce((sum, item) => sum + item.amount, 0);
//     const cgst = total * 0.015;
//     const sgst = total * 0.015;
//     const grandTotal = total + cgst + sgst;
//     return { total, cgst, sgst, grandTotal };
//   }, [items]);

//   const saveInvoice = async (saveAsNew = false) => {
//     const totals = calculateTotals();
//     const invoice = {
//       invoiceNo: saveAsNew ? `${Date.now()}` : invoiceNo,
//       purchaserName,
//       address,
//       contactNumber,
//       date,
//       paymentMethod,
//       items,
//       ...totals,
//       savedAt: new Date().toISOString()
//     };

//     try {
//       await window.storage.set(`invoice:${invoice.invoiceNo}`, JSON.stringify(invoice));
//       await loadInvoiceHistory();
//       alert(`Invoice ${saveAsNew ? 'saved as new' : 'saved'} successfully!`);
//       if (saveAsNew) {
//         setInvoiceNo(invoice.invoiceNo);
//       }
//     } catch (error) {
//       console.error('Error saving invoice:', error);
//       alert('Failed to save invoice. Please try again.');
//     }
//   };

//   const loadInvoice = (invoice) => {
//     setInvoiceNo(invoice.invoiceNo);
//     setPurchaserName(invoice.purchaserName);
//     setAddress(invoice.address);
//     setContactNumber(invoice.contactNumber || '');
//     setDate(invoice.date);
//     setPaymentMethod(invoice.paymentMethod || 'Cash');
//     setItems(invoice.items);
//   };

//   const duplicateInvoice = (invoice) => {
//     const newInvoiceNo = `${Date.now()}`;
//     setInvoiceNo(newInvoiceNo);
//     setPurchaserName(invoice.purchaserName);
//     setAddress(invoice.address);
//     setContactNumber(invoice.contactNumber || '');
//     setDate(new Date().toISOString().split('T')[0]);
//     setPaymentMethod(invoice.paymentMethod || 'Cash');
//     setItems(invoice.items);
//     alert('Invoice duplicated! Update details and save.');
//   };

//   const deleteInvoice = async (invoiceNo) => {
//     if (window.confirm('Are you sure you want to delete this invoice?')) {
//       try {
//         await window.storage.delete(`invoice:${invoiceNo}`);
//         await loadInvoiceHistory();
//       } catch (error) {
//         console.error('Error deleting invoice:', error);
//       }
//     }
//   };

//   const clearAll = () => {
//     if (window.confirm('Clear all fields?')) {
//       setInvoiceNo('');
//       setPurchaserName('');
//       setAddress('');
//       setContactNumber('');
//       setDate(new Date().toISOString().split('T')[0]);
//       setPaymentMethod('Cash');
//       setItems([]);
//     }
//   };

//   const exportAllToExcel = () => {
//     if (invoiceHistory.length === 0) {
//       alert('No invoices to export!');
//       return;
//     }

//     let csvContent = 'Invoice No,Date,Customer Name,Contact Number,Address,Payment Method,Items Description,Total Weight (g),Total,CGST,SGST,Grand Total\n';
    
//     invoiceHistory.forEach(inv => {
//       const descriptions = inv.items.map(item => item.description).filter(d => d).join('; ') || 'N/A';
//       const totalWeight = inv.items.reduce((sum, item) => sum + (item.weight || 0), 0);
//       csvContent += `"${inv.invoiceNo}","${inv.date}","${inv.purchaserName}","${inv.contactNumber || 'N/A'}","${inv.address}","${inv.paymentMethod || 'Cash'}","${descriptions}",${totalWeight.toFixed(2)},${inv.total.toFixed(2)},${inv.cgst.toFixed(2)},${inv.sgst.toFixed(2)},${inv.grandTotal.toFixed(2)}\n`;
//     });

//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const link = document.createElement('a');
//     const url = URL.createObjectURL(blob);
//     link.setAttribute('href', url);
//     link.setAttribute('download', `All_Invoices_${new Date().toISOString().split('T')[0]}.csv`);
//     link.style.visibility = 'hidden';
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     alert(`Exported ${invoiceHistory.length} invoices to CSV/Excel!`);
//   };

//   // ─── Builds the inner HTML for one invoice copy ───────────────────────────
//   const buildInvoiceHTML = (totals, copyLabel) => `
//     <div class="invoice-page" style="position:relative;">

//       <!-- COPY LABEL — top-right corner, very small -->
//       <div style="
//         position: absolute;
//         top: 0px;
//         right: 0px;
//         font-family: Arial, sans-serif;
//         font-size: 8px;
//         font-weight: bold;
//         letter-spacing: 1.5px;
//         text-transform: uppercase;
//         color: #7a6010;
//         border: 1px solid #b8860b;
//         padding: 2px 7px;
//         border-radius: 2px;
//         background: #fffef8;
//       ">${copyLabel}</div>

//       <div class="top-info">
//         <div class="gst-number">${includeGST ? 'GST No: 10AKGPG7148B1ZS' : ''}</div>
//         <div class="company-phone">📞 +91-9472688888</div>
//       </div>

//       <div class="header">
//         ${includeGST ? '' : '<div class="estimate-title">Rough Estimate</div>'}
//         <div class="company-name">GUPTA JEWELS</div>
//         <div class="invoice-title">Prop. Manoj Kumar Gupta</div>
//         <div class="company-address">Purani Bajaji Gali, Siwan, Bihar- 841226</div>
//       </div>

//       <div class="info-section">
//         <div class="info-block">
//           <div class="info-label">Purchaser Name</div>
//           <div class="info-value">${purchaserName}</div>
//           <div class="info-label">Contact Number</div>
//           <div class="info-value">${contactNumber || 'N/A'}</div>
//           <div class="info-label">Address</div>
//           <div class="info-value">${address}</div>
//         </div>
//         <div class="info-block">
//           <div class="info-label">Invoice No</div>
//           <div class="info-value">${invoiceNo}</div>
//           <div class="info-label">Date</div>
//           <div class="info-value">${new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
//           <div class="info-label">Payment Method</div>
//           <div class="info-value">${paymentMethod}</div>
//         </div>
//       </div>

//       <table>
//         <thead>
//           <tr>
//             <th style="width:40px;">S.No</th>
//             <th>Description</th>
//             <th style="width:60px;">Purity</th>
//             <th style="width:80px;">Rate/g</th>
//             <th style="width:70px;">Weight</th>
//             <th style="width:80px;">Making/g</th>
//             <th style="width:90px;">Amount</th>
//           </tr>
//         </thead>
//         <tbody>
//           ${items.map((item, idx) => `
//             <tr>
//               <td style="text-align:center;">${idx + 1}</td>
//               <td><strong>${item.description}</strong></td>
//               <td>${item.purity || ''}</td>
//               <td>₹${(item.rate || 0).toFixed(2)}</td>
//               <td>${(item.weight || 0).toFixed(2)}g</td>
//               <td>₹${(item.making || 0).toFixed(2)}</td>
//               <td style="text-align:right;"><strong>₹${(item.amount || 0).toFixed(2)}</strong></td>
//             </tr>
//           `).join('')}
//           <tr class="totals-row">
//             <td colspan="6" style="text-align:right;">Subtotal:</td>
//             <td style="text-align:right;"><strong>₹${totals.total.toFixed(2)}</strong></td>
//           </tr>
//           <tr class="totals-row">
//             <td colspan="6" style="text-align:right;">CGST (1.5%):</td>
//             <td style="text-align:right;">₹${totals.cgst.toFixed(2)}</td>
//           </tr>
//           <tr class="totals-row">
//             <td colspan="6" style="text-align:right;">SGST (1.5%):</td>
//             <td style="text-align:right;">₹${totals.sgst.toFixed(2)}</td>
//           </tr>
//           <tr class="grand-total-row">
//             <td colspan="6" style="text-align:right;">GRAND TOTAL:</td>
//             <td style="text-align:right;">₹${totals.grandTotal.toFixed(2)}</td>
//           </tr>
//         </tbody>
//       </table>

//       <div class="signatures">
//         <div class="signature-box">
//           <div class="signature-line">Customer Signature</div>
//         </div>
//         <div class="signature-box">
//           <div class="signature-line">Authorized Signatory<br/>For Gupta Jewels</div>
//         </div>
//       </div>

//       <div class="footer">
//         <p style="margin-bottom:5px;">Please note that the net amount includes gold value, cost of stone, product making charges, wastage, GST &amp; other taxes</p>
//         <p>This is a computer-generated invoice</p>
//         <p class="jurisdiction">SUBJECT TO SIWAN JURISDICTION ONLY</p>
//       </div>
//     </div>
//   `;

//   // ─── Export PDF: prints BOTH copies on one page (page-break between them) ──
//   const exportPDF = () => {
//     const totals = calculateTotals();
//     const printWindow = window.open('', '_blank');

//     const content = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="UTF-8"/>
//         <title>Invoice ${invoiceNo} — ${purchaserName}</title>
//         <style>
//           * { margin: 0; padding: 0; box-sizing: border-box; }
//           body {
//             font-family: Arial, sans-serif;
//             color: #333;
//             background: #fff;
//           }

//           /* Each copy sits on its own printed page */
//           .invoice-page {
//             padding: 30px;
//             page-break-after: always;
//           }
//           .invoice-page:last-child {
//             page-break-after: avoid;
//           }

//           .top-info {
//             display: flex;
//             justify-content: space-between;
//             align-items: flex-start;
//             margin-bottom: 10px;
//             font-size: 11px;
//           }
//           .gst-number { font-weight: bold; color: #666; }
//           .company-phone { font-weight: bold; color: #b8860b; }

//           .header {
//             text-align: center;
//             margin-bottom: 25px;
//             border-bottom: 3px solid #b8860b;
//             padding-bottom: 15px;
//           }
//           .company-name {
//             font-size: 36px;
//             font-weight: bold;
//             color: #b8860b;
//             margin-bottom: 3px;
//             letter-spacing: 2px;
//           }
//           .company-address { font-size: 14px; color: #666; margin-bottom: 8px; }
//           .invoice-title { font-size: 18px; color: #666; margin-top: 8px; font-weight: bold; }
//           .estimate-title {
//             font-size: 10px;
//             color: #b8860b;
//             font-weight: bold;
//             text-transform: uppercase;
//             letter-spacing: 1px;
//           }

//           .info-section {
//             display: flex;
//             justify-content: space-between;
//             margin: 25px 0;
//             background: #f9f9f9;
//             padding: 15px;
//             border-radius: 5px;
//           }
//           .info-block { flex: 1; }
//           .info-label {
//             font-weight: bold;
//             color: #666;
//             font-size: 11px;
//             text-transform: uppercase;
//             margin-top: 8px;
//           }
//           .info-label:first-child { margin-top: 0; }
//           .info-value { font-size: 14px; margin-top: 3px; margin-bottom: 8px; color: #333; }

//           table { width: 100%; border-collapse: collapse; margin: 20px 0 0 0; border: 1px solid #ddd; }
//           th {
//             background: #b8860b;
//             color: white;
//             padding: 10px 8px;
//             text-align: left;
//             font-weight: bold;
//             font-size: 12px;
//             border: 1px solid #a07a0a;
//           }
//           td { padding: 8px; border: 1px solid #ddd; font-size: 12px; }
//           tr:nth-child(even) { background: #f9f9f9; }

//           .totals-row { background: #fffef8; }
//           .totals-row td { padding: 10px; font-size: 13px; font-weight: 600; }
//           .grand-total-row { background: #b8860b; }
//           .grand-total-row td {
//             padding: 12px 10px;
//             font-size: 16px;
//             font-weight: bold;
//             color: Black;
//             border: 1px solid #a07a0a;
//           }

//           .signatures {
//             margin-top: 80px;
//             display: flex;
//             justify-content: space-between;
//             padding: 0 30px;
//           }
//           .signature-box { text-align: center; }
//           .signature-line {
//             border-top: 1px solid #333;
//             margin-top: 60px;
//             padding-top: 8px;
//             font-size: 12px;
//             font-weight: bold;
//           }

//           .footer {
//             margin-top: 40px;
//             text-align: center;
//             color: #666;
//             font-size: 10px;
//             border-top: 1px solid #ddd;
//             padding-top: 15px;
//           }
//           .jurisdiction { margin-top: 8px; font-size: 9px; color: #999; font-style: italic; }

//           @media print {
//             .invoice-page { padding: 15px; }
//             .signatures { margin-top: 60px; }
//           }
//         </style>
//       </head>
//       <body>
//         ${buildInvoiceHTML(totals, 'Original Copy')}
//         ${buildInvoiceHTML(totals, 'Duplicate Copy')}
//         <script>
//           window.onload = function() { window.print(); };
//         </script>
//       </body>
//       </html>
//     `;

//     printWindow.document.write(content);
//     printWindow.document.close();
//   };

//   const totals = calculateTotals();
//   const filteredHistory = invoiceHistory.filter(inv =>
//     inv.purchaserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     inv.invoiceNo.includes(searchTerm)
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
//       <div className="max-w-7xl mx-auto">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
//             <div className="border-b-4 border-yellow-600 pb-4 mb-6">
//               <h1 className="text-3xl font-bold text-gray-800">Gupta Jewels — Invoice Builder</h1>
//               <p className="text-gray-600">Premium billing UI • A4 PDF • Save &amp; Manage invoices</p>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Invoice No</label>
//                 <input type="text" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-600 focus:border-transparent" />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Purchaser Name</label>
//                 <input type="text" value={purchaserName} onChange={(e) => setPurchaserName(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-600 focus:border-transparent" />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
//                 <input type="tel" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)}
//                   placeholder="Enter phone number"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-600 focus:border-transparent" />
//               </div>
//             </div>

//             <div className="mb-6">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
//               <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-600 focus:border-transparent" />
//             </div>

//             <div className="mb-6">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
//               <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
//                 className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-600 focus:border-transparent" />
//               <p className="text-xs text-gray-500 mt-1">TIP: Auto-updates to today's date</p>
//             </div>

//             <div className="mb-6">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
//               <div className="flex gap-3">
//                 {['Cash', 'UPI', 'Card'].map(method => (
//                   <label key={method} className="flex items-center cursor-pointer">
//                     <input type="radio" name="paymentMethod" value={method}
//                       checked={paymentMethod === method} onChange={(e) => setPaymentMethod(e.target.value)}
//                       className="w-4 h-4 text-yellow-600 focus:ring-yellow-500" />
//                     <span className="ml-2 text-sm text-gray-700">{method}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>

//             <div className="mb-6">
//               <label className="flex items-center cursor-pointer">
//                 <input type="checkbox" checked={includeGST} onChange={(e) => setIncludeGST(e.target.checked)}
//                   className="w-4 h-4 text-yellow-600 focus:ring-yellow-500 rounded" />
//                 <span className="ml-2 text-sm text-gray-700">Include GST</span>
//               </label>
//             </div>

//             <div className="overflow-x-auto mb-4">
//               <table className="w-full border-collapse">
//                 <thead>
//                   <tr className="bg-gray-100">
//                     <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">S.No</th>
//                     <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Description</th>
//                     <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Purity</th>
//                     <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Rate/g</th>
//                     <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Weight</th>
//                     <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Making/g</th>
//                     <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Amount</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {items.map((item, idx) => (
//                     <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
//                       <td className="px-3 py-2 text-sm">{idx + 1}</td>
//                       <td className="px-3 py-2">
//                         <input type="text" value={item.description}
//                           onChange={(e) => updateItem(item.id, 'description', e.target.value)}
//                           className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-yellow-600"
//                           placeholder="Item name" />
//                       </td>
//                       <td className="px-3 py-2">
//                         <input type="text" value={item.purity}
//                           onChange={(e) => updateItem(item.id, 'purity', e.target.value)}
//                           className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-yellow-600"
//                           placeholder="Purity" />
//                       </td>
//                       <td className="px-3 py-2">
//                         <input type="number" value={item.rate}
//                           onChange={(e) => updateItem(item.id, 'rate', e.target.value)}
//                           className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-yellow-600"
//                           placeholder="0" />
//                       </td>
//                       <td className="px-3 py-2">
//                         <input type="number" value={item.weight}
//                           onChange={(e) => updateItem(item.id, 'weight', e.target.value)}
//                           className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-yellow-600"
//                           placeholder="0" />
//                       </td>
//                       <td className="px-3 py-2">
//                         <input type="number" value={item.making}
//                           onChange={(e) => updateItem(item.id, 'making', e.target.value)}
//                           className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-yellow-600"
//                           placeholder="0" />
//                       </td>
//                       <td className="px-3 py-2 text-sm font-semibold">₹{item.amount.toFixed(2)}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             <div className="flex flex-wrap gap-3 mb-4">
//               <button onClick={addItem}
//                 className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
//                 <Plus size={18} /> Add item
//               </button>
//               <button onClick={removeLastItem}
//                 className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
//                 <Trash2 size={18} /> Remove last
//               </button>
//               <button onClick={recalculate}
//                 className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
//                 <Calculator size={18} /> Recalculate
//               </button>
//             </div>

//             <div className="flex flex-wrap gap-3">
//               <button onClick={() => saveInvoice(false)}
//                 className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
//                 <Save size={18} /> Save Invoice
//               </button>
//               <button onClick={() => saveInvoice(true)}
//                 className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
//                 <FileText size={18} /> Save as New
//               </button>
//               <button onClick={exportPDF}
//                 className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
//                 <Download size={18} /> Export PDF
//               </button>
//             </div>

//             <p className="text-sm text-gray-600 mt-4">
//               Exporting PDF will open a print dialog with <strong>2 pages</strong> — Page 1: <em>Original Copy</em> (for customer), Page 2: <em>Duplicate Copy</em> (for your records).
//             </p>
//           </div>

//           <div className="space-y-6">
//             <div className="bg-white rounded-lg shadow-lg p-6">
//               <h2 className="text-xl font-bold text-gray-800 mb-2">Summary</h2>
//               <p className="text-sm text-gray-600 mb-4">Auto-calculated totals</p>
//               <div className="space-y-3">
//                 <div className="flex justify-between">
//                   <span className="text-gray-700">Total</span>
//                   <span className="font-semibold">₹{totals.total.toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-700">CGST (1.5%)</span>
//                   <span className="font-semibold">₹{totals.cgst.toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-700">SGST (1.5%)</span>
//                   <span className="font-semibold">₹{totals.sgst.toFixed(2)}</span>
//                 </div>
//                 <div className="border-t-2 border-yellow-800 pt-3 flex justify-between">
//                   <span className="text-lg font-bold text-yellow-800">Grand Total</span>
//                   <span className="text-lg font-bold text-yellow-800">₹{totals.grandTotal.toFixed(2)}</span>
//                 </div>
//               </div>

//               <div className="space-y-2 mt-4">
//                 <button onClick={clearAll}
//                   className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md transition-colors">
//                   Clear All
//                 </button>
//                 <button onClick={exportAllToExcel}
//                   className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 transition-colors">
//                   <FileSpreadsheet size={18} /> Export All to Excel
//                 </button>
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow-lg p-6">
//               <h2 className="text-xl font-bold text-gray-800 mb-4">Invoice History</h2>
//               <div className="relative mb-4">
//                 <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
//                 <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
//                   placeholder="Search by purchaser or invoice#"
//                   className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-600 focus:border-transparent" />
//               </div>

//               <div className="space-y-3 max-h-96 overflow-y-auto">
//                 {filteredHistory.length === 0 ? (
//                   <p className="text-gray-500 text-sm text-center py-4">No invoices saved yet</p>
//                 ) : (
//                   filteredHistory.map((inv) => (
//                     <div key={inv.invoiceNo} className="border border-gray-200 rounded-md p-3 hover:bg-gray-50 transition-colors">
//                       <div className="flex justify-between items-start mb-2">
//                         <div>
//                           <p className="font-semibold text-gray-800">#{inv.invoiceNo}</p>
//                           <p className="text-sm text-gray-600">{inv.purchaserName}</p>
//                           <p className="text-xs text-gray-500">{new Date(inv.date).toLocaleDateString()}</p>
//                           <p className="text-xs text-blue-600 font-medium">{inv.paymentMethod || 'Cash'}</p>
//                         </div>
//                         <p className="font-bold text-yellow-600">₹{inv.grandTotal.toFixed(2)}</p>
//                       </div>
//                       <div className="flex gap-2">
//                         <button onClick={() => loadInvoice(inv)}
//                           className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-3 py-1 rounded transition-colors">
//                           Load
//                         </button>
//                         <button onClick={() => duplicateInvoice(inv)}
//                           className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded transition-colors flex items-center gap-1">
//                           <Copy size={12} />
//                         </button>
//                         <button onClick={() => deleteInvoice(inv.invoiceNo)}
//                           className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded transition-colors">
//                           <X size={14} />
//                         </button>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;







// import './storage';
// import React, { useState, useEffect, useCallback } from 'react';
// import { Plus, Trash2, Calculator, Save, FileText, Download, Search, X, Copy, FileSpreadsheet } from 'lucide-react';

// function App() {
//   const [invoiceNo, setInvoiceNo] = useState('12');
//   const [purchaserName, setPurchaserName] = useState('Deepak');
//   const [address, setAddress] = useState('Purani Bazazi');
//   const [contactNumber, setContactNumber] = useState('');
//   const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
//   const [paymentMethod, setPaymentMethod] = useState('Cash');
//   const [includeGST, setIncludeGST] = useState(true);
//   const [items, setItems] = useState([]);
//   const [invoiceHistory, setInvoiceHistory] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');

//   useEffect(() => {
//     loadInvoiceHistory();
//   }, []);

//   const loadInvoiceHistory = async () => {
//     try {
//       const keys = await window.storage.list('invoice:');
//       if (keys && keys.keys) {
//         const invoices = [];
//         for (const key of keys.keys) {
//           try {
//             const result = await window.storage.get(key);
//             if (result) {
//               invoices.push(JSON.parse(result.value));
//             }
//           } catch (e) {
//             console.error('Error loading invoice:', e);
//           }
//         }
//         setInvoiceHistory(invoices.sort((a, b) => new Date(b.date) - new Date(a.date)));
//       }
//     } catch (error) {
//       console.error('Error loading history:', error);
//     }
//   };

//   const addItem = () => {
//     setItems([...items, {
//       id: Date.now(),
//       description: '',
//       purity: '',
//       rate: 0,
//       weight: 0,
//       making: 0,
//       amount: 0
//     }]);
//   };

//   const removeLastItem = () => {
//     if (items.length > 0) {
//       setItems(items.slice(0, -1));
//     }
//   };

//   const updateItem = useCallback((id, field, value) => {
//     setItems(prevItems => prevItems.map(item => {
//       if (item.id === id) {
//         const updatedItem = { ...item };
//         if (field === 'description' || field === 'purity') {
//           updatedItem[field] = value;
//         } else {
//           updatedItem[field] = parseFloat(value) || 0;
//         }
//         updatedItem.amount = (updatedItem.rate + updatedItem.making) * updatedItem.weight;
//         return updatedItem;
//       }
//       return item;
//     }));
//   }, []);

//   const recalculate = () => {
//     setItems(prevItems => prevItems.map(item => ({
//       ...item,
//       amount: (item.rate + item.making) * item.weight
//     })));
//   };

//   const calculateTotals = useCallback(() => {
//     const total = items.reduce((sum, item) => sum + item.amount, 0);
//     const cgst = total * 0.015;
//     const sgst = total * 0.015;
//     const grandTotal = total + cgst + sgst;
//     return { total, cgst, sgst, grandTotal };
//   }, [items]);

//   const saveInvoice = async (saveAsNew = false) => {
//     const totals = calculateTotals();
//     const invoice = {
//       invoiceNo: saveAsNew ? `${Date.now()}` : invoiceNo,
//       purchaserName,
//       address,
//       contactNumber,
//       date,
//       paymentMethod,
//       items,
//       ...totals,
//       savedAt: new Date().toISOString()
//     };

//     try {
//       await window.storage.set(`invoice:${invoice.invoiceNo}`, JSON.stringify(invoice));
//       await loadInvoiceHistory();
//       alert(`Invoice ${saveAsNew ? 'saved as new' : 'saved'} successfully!`);
//       if (saveAsNew) {
//         setInvoiceNo(invoice.invoiceNo);
//       }
//     } catch (error) {
//       console.error('Error saving invoice:', error);
//       alert('Failed to save invoice. Please try again.');
//     }
//   };

//   const loadInvoice = (invoice) => {
//     setInvoiceNo(invoice.invoiceNo);
//     setPurchaserName(invoice.purchaserName);
//     setAddress(invoice.address);
//     setContactNumber(invoice.contactNumber || '');
//     setDate(invoice.date);
//     setPaymentMethod(invoice.paymentMethod || 'Cash');
//     setItems(invoice.items);
//   };

//   const duplicateInvoice = (invoice) => {
//     const newInvoiceNo = `${Date.now()}`;
//     setInvoiceNo(newInvoiceNo);
//     setPurchaserName(invoice.purchaserName);
//     setAddress(invoice.address);
//     setContactNumber(invoice.contactNumber || '');
//     setDate(new Date().toISOString().split('T')[0]);
//     setPaymentMethod(invoice.paymentMethod || 'Cash');
//     setItems(invoice.items);
//     alert('Invoice duplicated! Update details and save.');
//   };

//   const deleteInvoice = async (invoiceNo) => {
//     if (window.confirm('Are you sure you want to delete this invoice?')) {
//       try {
//         await window.storage.delete(`invoice:${invoiceNo}`);
//         await loadInvoiceHistory();
//       } catch (error) {
//         console.error('Error deleting invoice:', error);
//       }
//     }
//   };

//   const clearAll = () => {
//     if (window.confirm('Clear all fields?')) {
//       setInvoiceNo('');
//       setPurchaserName('');
//       setAddress('');
//       setContactNumber('');
//       setDate(new Date().toISOString().split('T')[0]);
//       setPaymentMethod('Cash');
//       setItems([]);
//     }
//   };

//   const exportAllToExcel = () => {
//     if (invoiceHistory.length === 0) {
//       alert('No invoices to export!');
//       return;
//     }

//     let csvContent = 'Invoice No,Date,Customer Name,Contact Number,Address,Payment Method,Items Description,Total Weight (g),Total,CGST,SGST,Grand Total\n';
    
//     invoiceHistory.forEach(inv => {
//       const descriptions = inv.items.map(item => item.description).filter(d => d).join('; ') || 'N/A';
//       const totalWeight = inv.items.reduce((sum, item) => sum + (item.weight || 0), 0);
//       csvContent += `"${inv.invoiceNo}","${inv.date}","${inv.purchaserName}","${inv.contactNumber || 'N/A'}","${inv.address}","${inv.paymentMethod || 'Cash'}","${descriptions}",${totalWeight.toFixed(2)},${inv.total.toFixed(2)},${inv.cgst.toFixed(2)},${inv.sgst.toFixed(2)},${inv.grandTotal.toFixed(2)}\n`;
//     });

//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const link = document.createElement('a');
//     const url = URL.createObjectURL(blob);
//     link.setAttribute('href', url);
//     link.setAttribute('download', `All_Invoices_${new Date().toISOString().split('T')[0]}.csv`);
//     link.style.visibility = 'hidden';
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     alert(`Exported ${invoiceHistory.length} invoices to CSV/Excel!`);
//   };

//   // ─── Builds the inner HTML for one invoice copy ───────────────────────────
//   const buildInvoiceHTML = (totals, copyLabel) => `
//     <div class="invoice-page" style="position:relative;">

//       <!-- COPY LABEL — top-right corner, very small -->
//       <div style="
//         position: absolute;
//         top: 0px;
//         right: 0px;
//         font-family: Arial, sans-serif;
//         font-size: 8px;
//         font-weight: bold;
//         letter-spacing: 1.5px;
//         text-transform: uppercase;
//         color: #7a6010;
//         border: 1px solid #b8860b;
//         padding: 2px 7px;
//         border-radius: 2px;
//         background: #fffef8;
//       ">${copyLabel}</div>

//       <div class="top-info">
//         <div class="gst-number">${includeGST ? 'GST No: 10AKGPG7148B1ZS' : ''}</div>
//         <div class="company-phone">📞 +91-9472688888</div>
//       </div>

//       <div class="header">
//         ${includeGST ? '' : '<div class="estimate-title">Rough Estimate</div>'}
//         <div class="company-name">GUPTA JEWELS</div>
//         <div class="invoice-title">Prop. Manoj Kumar Gupta</div>
//         <div class="company-address">Purani Bajaji Gali, Siwan, Bihar- 841226</div>
//       </div>

//       <div class="info-section">
//         <div class="info-block">
//           <div class="info-label">Purchaser Name</div>
//           <div class="info-value">${purchaserName}</div>
//           <div class="info-label">Contact Number</div>
//           <div class="info-value">${contactNumber || 'N/A'}</div>
//           <div class="info-label">Address</div>
//           <div class="info-value">${address}</div>
//         </div>
//         <div class="info-block">
//           <div class="info-label">Invoice No</div>
//           <div class="info-value">${invoiceNo}</div>
//           <div class="info-label">Date</div>
//           <div class="info-value">${new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
//           <div class="info-label">Payment Method</div>
//           <div class="info-value">${paymentMethod}</div>
//         </div>
//       </div>

//       <table>
//         <thead>
//           <tr>
//             <th style="width:40px;">S.No</th>
//             <th>Description</th>
//             <th style="width:60px;">Purity</th>
//             <th style="width:80px;">Rate/g</th>
//             <th style="width:70px;">Weight</th>
//             <th style="width:80px;">Making/g</th>
//             <th style="width:90px;">Amount</th>
//           </tr>
//         </thead>
//         <tbody>
//           ${items.map((item, idx) => `
//             <tr>
//               <td style="text-align:center;">${idx + 1}</td>
//               <td><strong>${item.description}</strong></td>
//               <td>${item.purity || ''}</td>
//               <td>₹${(item.rate || 0).toFixed(2)}</td>
//               <td>${(item.weight || 0).toFixed(2)}g</td>
//               <td>₹${(item.making || 0).toFixed(2)}</td>
//               <td style="text-align:right;"><strong>₹${(item.amount || 0).toFixed(2)}</strong></td>
//             </tr>
//           `).join('')}
//           <tr class="totals-row">
//             <td colspan="6" style="text-align:right;">Subtotal:</td>
//             <td style="text-align:right;"><strong>₹${totals.total.toFixed(2)}</strong></td>
//           </tr>
//           <tr class="totals-row">
//             <td colspan="6" style="text-align:right;">CGST (1.5%):</td>
//             <td style="text-align:right;">₹${totals.cgst.toFixed(2)}</td>
//           </tr>
//           <tr class="totals-row">
//             <td colspan="6" style="text-align:right;">SGST (1.5%):</td>
//             <td style="text-align:right;">₹${totals.sgst.toFixed(2)}</td>
//           </tr>
//           <tr class="grand-total-row">
//             <td colspan="6" style="text-align:right;">GRAND TOTAL:</td>
//             <td style="text-align:right;">₹${totals.grandTotal.toFixed(2)}</td>
//           </tr>
//         </tbody>
//       </table>

//       <div class="signatures">
//         <div class="signature-box">
//           <div class="signature-line">Customer Signature</div>
//         </div>
//         <div class="signature-box">
//           <div class="signature-line">Authorized Signatory<br/>For Gupta Jewels</div>
//         </div>
//       </div>

//       <div class="footer">
//         <p style="margin-bottom:5px;">Please note that the net amount includes gold value, cost of stone, product making charges, wastage, GST &amp; other taxes</p>
//         <p>This is a computer-generated invoice</p>
//         <p class="jurisdiction">SUBJECT TO SIWAN JURISDICTION ONLY</p>
//       </div>
//     </div>
//   `;

//   // ─── Export PDF: prints BOTH copies on one page (page-break between them) ──
//   const exportPDF = () => {
//     const totals = calculateTotals();
//     const printWindow = window.open('', '_blank');

//     const content = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="UTF-8"/>
//         <title>Invoice ${invoiceNo} — ${purchaserName}</title>
//         <style>
//           * { margin: 0; padding: 0; box-sizing: border-box; }
//           body {
//             font-family: Arial, sans-serif;
//             color: #333;
//             background: #fff;
//           }

//           /* Each copy sits on its own printed page */
//           .invoice-page {
//             padding: 30px;
//             page-break-after: always;
//           }
//           .invoice-page:last-child {
//             page-break-after: avoid;
//           }

//           .top-info {
//             display: flex;
//             justify-content: space-between;
//             align-items: flex-start;
//             margin-bottom: 10px;
//             font-size: 11px;
//           }
//           .gst-number { font-weight: bold; color: #666; }
//           .company-phone { font-weight: bold; color: #b8860b; }

//           .header {
//             text-align: center;
//             margin-bottom: 25px;
//             border-bottom: 3px solid #b8860b;
//             padding-bottom: 15px;
//           }
//           .company-name {
//             font-size: 36px;
//             font-weight: bold;
//             color: #b8860b;
//             margin-bottom: 3px;
//             letter-spacing: 2px;
//           }
//           .company-address { font-size: 14px; color: #666; margin-bottom: 8px; }
//           .invoice-title { font-size: 18px; color: #666; margin-top: 8px; font-weight: bold; }
//           .estimate-title {
//             font-size: 10px;
//             color: #b8860b;
//             font-weight: bold;
//             text-transform: uppercase;
//             letter-spacing: 1px;
//           }

//           .info-section {
//             display: flex;
//             justify-content: space-between;
//             margin: 25px 0;
//             background: #f9f9f9;
//             padding: 15px;
//             border-radius: 5px;
//           }
//           .info-block { flex: 1; }
//           .info-label {
//             font-weight: bold;
//             color: #666;
//             font-size: 11px;
//             text-transform: uppercase;
//             margin-top: 8px;
//           }
//           .info-label:first-child { margin-top: 0; }
//           .info-value { font-size: 14px; margin-top: 3px; margin-bottom: 8px; color: #333; }

//           table { width: 100%; border-collapse: collapse; margin: 20px 0 0 0; border: 1px solid #ddd; }
//           th {
//             background: #b8860b;
//             color: white;
//             padding: 10px 8px;
//             text-align: left;
//             font-weight: bold;
//             font-size: 12px;
//             border: 1px solid #a07a0a;
//           }
//           td { padding: 8px; border: 1px solid #ddd; font-size: 12px; }
//           tr:nth-child(even) { background: #f9f9f9; }

//           .totals-row { background: #fffef8; }
//           .totals-row td { padding: 10px; font-size: 13px; font-weight: 600; }
//           .grand-total-row { background: #b8860b; }
//           .grand-total-row td {
//             padding: 12px 10px;
//             font-size: 16px;
//             font-weight: bold;
//             color: Black;
//             border: 1px solid #a07a0a;
//           }

//           .signatures {
//             margin-top: 80px;
//             display: flex;
//             justify-content: space-between;
//             padding: 0 30px;
//           }
//           .signature-box { text-align: center; }
//           .signature-line {
//             border-top: 1px solid #333;
//             margin-top: 60px;
//             padding-top: 8px;
//             font-size: 12px;
//             font-weight: bold;
//           }

//           .footer {
//             margin-top: 40px;
//             text-align: center;
//             color: #666;
//             font-size: 10px;
//             border-top: 1px solid #ddd;
//             padding-top: 15px;
//           }
//           .jurisdiction { margin-top: 8px; font-size: 9px; color: #999; font-style: italic; }

//           @media print {
//             .invoice-page { padding: 15px; }
//             .signatures { margin-top: 60px; }
//           }
//         </style>
//       </head>
//       <body>
//         ${buildInvoiceHTML(totals, 'Original Copy')}
//         ${buildInvoiceHTML(totals, 'Duplicate Copy')}
//         <script>
//           window.onload = function() { window.print(); };
//         </script>
//       </body>
//       </html>
//     `;

//     printWindow.document.write(content);
//     printWindow.document.close();
//   };

//   const totals = calculateTotals();
//   const filteredHistory = invoiceHistory.filter(inv =>
//     inv.purchaserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     inv.invoiceNo.includes(searchTerm)
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
//       <div className="max-w-7xl mx-auto">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
//             <div className="border-b-4 border-yellow-600 pb-4 mb-6">
//               <h1 className="text-3xl font-bold text-gray-800">Gupta Jewels — Invoice Builder</h1>
//               <p className="text-gray-600">Premium billing UI • A4 PDF • Save &amp; Manage invoices</p>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Invoice No</label>
//                 <input type="text" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-600 focus:border-transparent" />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Purchaser Name</label>
//                 <input type="text" value={purchaserName} onChange={(e) => setPurchaserName(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-600 focus:border-transparent" />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
//                 <input type="tel" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)}
//                   placeholder="Enter phone number"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-600 focus:border-transparent" />
//               </div>
//             </div>

//             <div className="mb-6">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
//               <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-600 focus:border-transparent" />
//             </div>

//             <div className="mb-6">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
//               <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
//                 className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-600 focus:border-transparent" />
//               <p className="text-xs text-gray-500 mt-1">TIP: Auto-updates to today's date</p>
//             </div>

//             <div className="mb-6">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
//               <div className="flex gap-3">
//                 {['Cash', 'UPI', 'Card'].map(method => (
//                   <label key={method} className="flex items-center cursor-pointer">
//                     <input type="radio" name="paymentMethod" value={method}
//                       checked={paymentMethod === method} onChange={(e) => setPaymentMethod(e.target.value)}
//                       className="w-4 h-4 text-yellow-600 focus:ring-yellow-500" />
//                     <span className="ml-2 text-sm text-gray-700">{method}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>

//             <div className="mb-6">
//               <label className="flex items-center cursor-pointer">
//                 <input type="checkbox" checked={includeGST} onChange={(e) => setIncludeGST(e.target.checked)}
//                   className="w-4 h-4 text-yellow-600 focus:ring-yellow-500 rounded" />
//                 <span className="ml-2 text-sm text-gray-700">Include GST</span>
//               </label>
//             </div>

//             <div className="overflow-x-auto mb-4">
//               <table className="w-full border-collapse">
//                 <thead>
//                   <tr className="bg-gray-100">
//                     <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">S.No</th>
//                     <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Description</th>
//                     <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Purity</th>
//                     <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Rate/g</th>
//                     <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Weight</th>
//                     <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Making/g</th>
//                     <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Amount</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {items.map((item, idx) => (
//                     <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
//                       <td className="px-3 py-2 text-sm">{idx + 1}</td>
//                       <td className="px-3 py-2">
//                         <input type="text" value={item.description}
//                           onChange={(e) => updateItem(item.id, 'description', e.target.value)}
//                           className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-yellow-600"
//                           placeholder="Item name" />
//                       </td>
//                       <td className="px-3 py-2">
//                         <input type="text" value={item.purity}
//                           onChange={(e) => updateItem(item.id, 'purity', e.target.value)}
//                           className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-yellow-600"
//                           placeholder="Purity" />
//                       </td>
//                       <td className="px-3 py-2">
//                         <input type="number" value={item.rate}
//                           onChange={(e) => updateItem(item.id, 'rate', e.target.value)}
//                           className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-yellow-600"
//                           placeholder="0" />
//                       </td>
//                       <td className="px-3 py-2">
//                         <input type="number" value={item.weight}
//                           onChange={(e) => updateItem(item.id, 'weight', e.target.value)}
//                           className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-yellow-600"
//                           placeholder="0" />
//                       </td>
//                       <td className="px-3 py-2">
//                         <input type="number" value={item.making}
//                           onChange={(e) => updateItem(item.id, 'making', e.target.value)}
//                           className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-yellow-600"
//                           placeholder="0" />
//                       </td>
//                       <td className="px-3 py-2 text-sm font-semibold">₹{item.amount.toFixed(2)}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             <div className="flex flex-wrap gap-3 mb-4">
//               <button onClick={addItem}
//                 className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
//                 <Plus size={18} /> Add item
//               </button>
//               <button onClick={removeLastItem}
//                 className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
//                 <Trash2 size={18} /> Remove last
//               </button>
//               <button onClick={recalculate}
//                 className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
//                 <Calculator size={18} /> Recalculate
//               </button>
//             </div>

//             <div className="flex flex-wrap gap-3">
//               <button onClick={() => saveInvoice(false)}
//                 className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
//                 <Save size={18} /> Save Invoice
//               </button>
//               <button onClick={() => saveInvoice(true)}
//                 className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
//                 <FileText size={18} /> Save as New
//               </button>
//               <button onClick={exportPDF}
//                 className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
//                 <Download size={18} /> Export PDF
//               </button>
//             </div>

//             <p className="text-sm text-gray-600 mt-4">
//               Exporting PDF will open a print dialog with <strong>2 pages</strong> — Page 1: <em>Original Copy</em> (for customer), Page 2: <em>Duplicate Copy</em> (for your records).
//             </p>
//           </div>

//           <div className="space-y-6">
//             <div className="bg-white rounded-lg shadow-lg p-6">
//               <h2 className="text-xl font-bold text-gray-800 mb-2">Summary</h2>
//               <p className="text-sm text-gray-600 mb-4">Auto-calculated totals</p>
//               <div className="space-y-3">
//                 <div className="flex justify-between">
//                   <span className="text-gray-700">Total</span>
//                   <span className="font-semibold">₹{totals.total.toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-700">CGST (1.5%)</span>
//                   <span className="font-semibold">₹{totals.cgst.toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-700">SGST (1.5%)</span>
//                   <span className="font-semibold">₹{totals.sgst.toFixed(2)}</span>
//                 </div>
//                 <div className="border-t-2 border-yellow-800 pt-3 flex justify-between">
//                   <span className="text-lg font-bold text-yellow-800">Grand Total</span>
//                   <span className="text-lg font-bold text-yellow-800">₹{totals.grandTotal.toFixed(2)}</span>
//                 </div>
//               </div>

//               <div className="space-y-2 mt-4">
//                 <button onClick={clearAll}
//                   className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md transition-colors">
//                   Clear All
//                 </button>
//                 <button onClick={exportAllToExcel}
//                   className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 transition-colors">
//                   <FileSpreadsheet size={18} /> Export All to Excel
//                 </button>
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow-lg p-6">
//               <h2 className="text-xl font-bold text-gray-800 mb-4">Invoice History</h2>
//               <div className="relative mb-4">
//                 <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
//                 <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
//                   placeholder="Search by purchaser or invoice#"
//                   className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-600 focus:border-transparent" />
//               </div>

//               <div className="space-y-3 max-h-96 overflow-y-auto">
//                 {filteredHistory.length === 0 ? (
//                   <p className="text-gray-500 text-sm text-center py-4">No invoices saved yet</p>
//                 ) : (
//                   filteredHistory.map((inv) => (
//                     <div key={inv.invoiceNo} className="border border-gray-200 rounded-md p-3 hover:bg-gray-50 transition-colors">
//                       <div className="flex justify-between items-start mb-2">
//                         <div>
//                           <p className="font-semibold text-gray-800">#{inv.invoiceNo}</p>
//                           <p className="text-sm text-gray-600">{inv.purchaserName}</p>
//                           <p className="text-xs text-gray-500">{new Date(inv.date).toLocaleDateString()}</p>
//                           <p className="text-xs text-blue-600 font-medium">{inv.paymentMethod || 'Cash'}</p>
//                         </div>
//                         <p className="font-bold text-yellow-600">₹{inv.grandTotal.toFixed(2)}</p>
//                       </div>
//                       <div className="flex gap-2">
//                         <button onClick={() => loadInvoice(inv)}
//                           className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-3 py-1 rounded transition-colors">
//                           Load
//                         </button>
//                         <button onClick={() => duplicateInvoice(inv)}
//                           className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded transition-colors flex items-center gap-1">
//                           <Copy size={12} />
//                         </button>
//                         <button onClick={() => deleteInvoice(inv.invoiceNo)}
//                           className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded transition-colors">
//                           <X size={14} />
//                         </button>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;







// import './storage';
// import React, { useState, useEffect, useCallback } from 'react';
// import { Plus, Trash2, Calculator, Save, FileText, Download, Search, X, Copy, FileSpreadsheet } from 'lucide-react';

// function App() {
//   const [invoiceNo, setInvoiceNo] = useState('12');
//   const [purchaserName, setPurchaserName] = useState('Deepak');
//   const [address, setAddress] = useState('Purani Bazazi');
//   const [contactNumber, setContactNumber] = useState('');
//   const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
//   const [paymentMethod, setPaymentMethod] = useState('Cash');
//   const [includeGST, setIncludeGST] = useState(true);
//   const [items, setItems] = useState([]);
//   const [invoiceHistory, setInvoiceHistory] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');

//   useEffect(() => {
//     loadInvoiceHistory();
//   }, []);

//   const loadInvoiceHistory = async () => {
//     try {
//       const keys = await window.storage.list('invoice:');
//       if (keys && keys.keys) {
//         const invoices = [];
//         for (const key of keys.keys) {
//           try {
//             const result = await window.storage.get(key);
//             if (result) {
//               invoices.push(JSON.parse(result.value));
//             }
//           } catch (e) {
//             console.error('Error loading invoice:', e);
//           }
//         }
//         setInvoiceHistory(invoices.sort((a, b) => new Date(b.date) - new Date(a.date)));
//       }
//     } catch (error) {
//       console.error('Error loading history:', error);
//     }
//   };

//   const addItem = () => {
//     setItems([...items, {
//       id: Date.now(),
//       description: '',
//       purity: '',
//       rate: 0,
//       weight: 0,
//       making: 0,
//       amount: 0
//     }]);
//   };

//   const removeLastItem = () => {
//     if (items.length > 0) {
//       setItems(items.slice(0, -1));
//     }
//   };

//   const updateItem = useCallback((id, field, value) => {
//     setItems(prevItems => prevItems.map(item => {
//       if (item.id === id) {
//         const updatedItem = { ...item };
//         if (field === 'description' || field === 'purity') {
//           updatedItem[field] = value;
//         } else {
//           updatedItem[field] = parseFloat(value) || 0;
//         }
//         updatedItem.amount = (updatedItem.rate + updatedItem.making) * updatedItem.weight;
//         return updatedItem;
//       }
//       return item;
//     }));
//   }, []);

//   const recalculate = () => {
//     setItems(prevItems => prevItems.map(item => ({
//       ...item,
//       amount: (item.rate + item.making) * item.weight
//     })));
//   };

//   const calculateTotals = useCallback(() => {
//     const total = items.reduce((sum, item) => sum + item.amount, 0);
//     const cgst = total * 0.015;
//     const sgst = total * 0.015;
//     const grandTotal = total + cgst + sgst;
//     return { total, cgst, sgst, grandTotal };
//   }, [items]);

//   const saveInvoice = async (saveAsNew = false) => {
//     const totals = calculateTotals();
//     const invoice = {
//       invoiceNo: saveAsNew ? `${Date.now()}` : invoiceNo,
//       purchaserName,
//       address,
//       contactNumber,
//       date,
//       paymentMethod,
//       items,
//       ...totals,
//       savedAt: new Date().toISOString()
//     };

//     try {
//       await window.storage.set(`invoice:${invoice.invoiceNo}`, JSON.stringify(invoice));
//       await loadInvoiceHistory();
//       alert(`Invoice ${saveAsNew ? 'saved as new' : 'saved'} successfully!`);
//       if (saveAsNew) {
//         setInvoiceNo(invoice.invoiceNo);
//       }
//     } catch (error) {
//       console.error('Error saving invoice:', error);
//       alert('Failed to save invoice. Please try again.');
//     }
//   };

//   const loadInvoice = (invoice) => {
//     setInvoiceNo(invoice.invoiceNo);
//     setPurchaserName(invoice.purchaserName);
//     setAddress(invoice.address);
//     setContactNumber(invoice.contactNumber || '');
//     setDate(invoice.date);
//     setPaymentMethod(invoice.paymentMethod || 'Cash');
//     setItems(invoice.items);
//   };

//   const duplicateInvoice = (invoice) => {
//     const newInvoiceNo = `${Date.now()}`;
//     setInvoiceNo(newInvoiceNo);
//     setPurchaserName(invoice.purchaserName);
//     setAddress(invoice.address);
//     setContactNumber(invoice.contactNumber || '');
//     setDate(new Date().toISOString().split('T')[0]);
//     setPaymentMethod(invoice.paymentMethod || 'Cash');
//     setItems(invoice.items);
//     alert('Invoice duplicated! Update details and save.');
//   };

//   const deleteInvoice = async (invoiceNo) => {
//     if (window.confirm('Are you sure you want to delete this invoice?')) {
//       try {
//         await window.storage.delete(`invoice:${invoiceNo}`);
//         await loadInvoiceHistory();
//       } catch (error) {
//         console.error('Error deleting invoice:', error);
//       }
//     }
//   };

//   const clearAll = () => {
//     if (window.confirm('Clear all fields?')) {
//       setInvoiceNo('');
//       setPurchaserName('');
//       setAddress('');
//       setContactNumber('');
//       setDate(new Date().toISOString().split('T')[0]);
//       setPaymentMethod('Cash');
//       setItems([]);
//     }
//   };

//   const exportAllToExcel = () => {
//     if (invoiceHistory.length === 0) {
//       alert('No invoices to export!');
//       return;
//     }

//     let csvContent = 'Invoice No,Date,Customer Name,Contact Number,Address,Payment Method,Items Description,Total Weight (g),Total,CGST,SGST,Grand Total\n';
    
//     invoiceHistory.forEach(inv => {
//       const descriptions = inv.items.map(item => item.description).filter(d => d).join('; ') || 'N/A';
//       const totalWeight = inv.items.reduce((sum, item) => sum + (item.weight || 0), 0);
//       csvContent += `"${inv.invoiceNo}","${inv.date}","${inv.purchaserName}","${inv.contactNumber || 'N/A'}","${inv.address}","${inv.paymentMethod || 'Cash'}","${descriptions}",${totalWeight.toFixed(2)},${inv.total.toFixed(2)},${inv.cgst.toFixed(2)},${inv.sgst.toFixed(2)},${inv.grandTotal.toFixed(2)}\n`;
//     });

//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const link = document.createElement('a');
//     const url = URL.createObjectURL(blob);
//     link.setAttribute('href', url);
//     link.setAttribute('download', `All_Invoices_${new Date().toISOString().split('T')[0]}.csv`);
//     link.style.visibility = 'hidden';
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     alert(`Exported ${invoiceHistory.length} invoices to CSV/Excel!`);
//   };

//   // ─── Builds the inner HTML for one invoice copy ───────────────────────────
//   const buildInvoiceHTML = (totals, copyLabel) => `
//     <div class="invoice-page" style="position:relative;">

//       <!-- COPY LABEL — top-right corner, very small -->
//       <div style="
//         position: absolute;
//         top: 0px;
//         right: 0px;
//         font-family: Arial, sans-serif;
//         font-size: 8px;
//         font-weight: bold;
//         letter-spacing: 1.5px;
//         text-transform: uppercase;
//         color: #7a6010;
//         border: 1px solid #b8860b;
//         padding: 2px 7px;
//         border-radius: 2px;
//         background: #fffef8;
//       ">${copyLabel}</div>

//       <div class="top-info">
//         <div class="gst-number">${includeGST ? 'GST No: 10AKGPG7148B1ZS' : ''}</div>
//         <div class="company-phone">📞 +91-9472688888</div>
//       </div>

//       <div class="header">
//         ${includeGST ? '' : '<div class="estimate-title">Rough Estimate</div>'}
//         <div class="company-name">GUPTA JEWELS</div>
//         <div class="invoice-title">Prop. Manoj Kumar Gupta</div>
//         <div class="company-address">Purani Bajaji Gali, Siwan, Bihar- 841226</div>
//       </div>

//       <div class="info-section">
//         <div class="info-block">
//           <div class="info-label">Purchaser Name</div>
//           <div class="info-value">${purchaserName}</div>
//           <div class="info-label">Contact Number</div>
//           <div class="info-value">${contactNumber || 'N/A'}</div>
//           <div class="info-label">Address</div>
//           <div class="info-value">${address}</div>
//         </div>
//         <div class="info-block">
//           <div class="info-label">Invoice No</div>
//           <div class="info-value">${invoiceNo}</div>
//           <div class="info-label">Date</div>
//           <div class="info-value">${new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
//           <div class="info-label">Payment Method</div>
//           <div class="info-value">${paymentMethod}</div>
//         </div>
//       </div>

//       <table>
//         <thead>
//           <tr>
//             <th style="width:40px;">S.No</th>
//             <th>Description</th>
//             <th style="width:60px;">Purity</th>
//             <th style="width:80px;">Rate/g</th>
//             <th style="width:70px;">Weight</th>
//             <th style="width:80px;">Making/g</th>
//             <th style="width:90px;">Amount</th>
//           </tr>
//         </thead>
//         <tbody>
//           ${items.map((item, idx) => `
//             <tr>
//               <td style="text-align:center;">${idx + 1}</td>
//               <td><strong>${item.description}</strong></td>
//               <td>${item.purity || ''}</td>
//               <td>₹${(item.rate || 0).toFixed(2)}</td>
//               <td>${(item.weight || 0).toFixed(2)}g</td>
//               <td>₹${(item.making || 0).toFixed(2)}</td>
//               <td style="text-align:right;"><strong>₹${(item.amount || 0).toFixed(2)}</strong></td>
//             </tr>
//           `).join('')}
//           <tr class="totals-row">
//             <td colspan="6" style="text-align:right;">Subtotal:</td>
//             <td style="text-align:right;"><strong>₹${totals.total.toFixed(2)}</strong></td>
//           </tr>
//           <tr class="totals-row">
//             <td colspan="6" style="text-align:right;">CGST (1.5%):</td>
//             <td style="text-align:right;">₹${totals.cgst.toFixed(2)}</td>
//           </tr>
//           <tr class="totals-row">
//             <td colspan="6" style="text-align:right;">SGST (1.5%):</td>
//             <td style="text-align:right;">₹${totals.sgst.toFixed(2)}</td>
//           </tr>
//           <tr class="grand-total-row">
//             <td colspan="6" style="text-align:right;">GRAND TOTAL:</td>
//             <td style="text-align:right;">₹${totals.grandTotal.toFixed(2)}</td>
//           </tr>
//         </tbody>
//       </table>

//       <div class="signatures">
//         <div class="signature-box">
//           <div class="signature-line">Customer Signature</div>
//         </div>
//         <div class="signature-box">
//           <div class="signature-line">Authorized Signatory<br/>For Gupta Jewels</div>
//         </div>
//       </div>

//       <div class="footer">
//         <p style="margin-bottom:5px;">Please note that the net amount includes gold value, cost of stone, product making charges, wastage, GST &amp; other taxes</p>
//         <p>This is a computer-generated invoice</p>
//         <p class="jurisdiction">SUBJECT TO SIWAN JURISDICTION ONLY</p>
//       </div>
//     </div>
//   `;

//   // ─── Export PDF: prints BOTH copies on one page (page-break between them) ──
//   const exportPDF = () => {
//     const totals = calculateTotals();
//     const printWindow = window.open('', '_blank');

//     const content = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="UTF-8"/>
//         <title>Invoice ${invoiceNo} — ${purchaserName}</title>
//         <style>
//           * { margin: 0; padding: 0; box-sizing: border-box; }
//           body {
//             font-family: Arial, sans-serif;
//             color: #333;
//             background: #fff;
//           }

//           /* Each copy sits on its own printed page */
//           .invoice-page {
//             padding: 30px;
//             page-break-after: always;
//           }
//           .invoice-page:last-child {
//             page-break-after: avoid;
//           }

//           .top-info {
//             display: flex;
//             justify-content: space-between;
//             align-items: flex-start;
//             margin-bottom: 10px;
//             font-size: 11px;
//           }
//           .gst-number { font-weight: bold; color: #666; }
//           .company-phone { font-weight: bold; color: #b8860b; }

//           .header {
//             text-align: center;
//             margin-bottom: 25px;
//             border-bottom: 3px solid #b8860b;
//             padding-bottom: 15px;
//           }
//           .company-name {
//             font-size: 36px;
//             font-weight: bold;
//             color: #b8860b;
//             margin-bottom: 3px;
//             letter-spacing: 2px;
//           }
//           .company-address { font-size: 14px; color: #666; margin-bottom: 8px; }
//           .invoice-title { font-size: 18px; color: #666; margin-top: 8px; font-weight: bold; }
//           .estimate-title {
//             font-size: 10px;
//             color: #b8860b;
//             font-weight: bold;
//             text-transform: uppercase;
//             letter-spacing: 1px;
//           }

//           .info-section {
//             display: flex;
//             justify-content: space-between;
//             margin: 25px 0;
//             background: #f9f9f9;
//             padding: 15px;
//             border-radius: 5px;
//           }
//           .info-block { flex: 1; }
//           .info-label {
//             font-weight: bold;
//             color: #666;
//             font-size: 11px;
//             text-transform: uppercase;
//             margin-top: 8px;
//           }
//           .info-label:first-child { margin-top: 0; }
//           .info-value { font-size: 14px; margin-top: 3px; margin-bottom: 8px; color: #333; }

//           table { width: 100%; border-collapse: collapse; margin: 20px 0 0 0; border: 1px solid #ddd; }
//           th {
//             background: #b8860b;
//             color: white;
//             padding: 10px 8px;
//             text-align: left;
//             font-weight: bold;
//             font-size: 12px;
//             border: 1px solid #a07a0a;
//           }
//           td { padding: 8px; border: 1px solid #ddd; font-size: 12px; }
//           tr:nth-child(even) { background: #f9f9f9; }

//           .totals-row { background: #fffef8; }
//           .totals-row td { padding: 10px; font-size: 13px; font-weight: 600; }
//           .grand-total-row { background: #b8860b; }
//           .grand-total-row td {
//             padding: 12px 10px;
//             font-size: 16px;
//             font-weight: bold;
//             color: Black;
//             border: 1px solid #a07a0a;
//           }

//           .signatures {
//             margin-top: 80px;
//             display: flex;
//             justify-content: space-between;
//             padding: 0 30px;
//           }
//           .signature-box { text-align: center; }
//           .signature-line {
//             border-top: 1px solid #333;
//             margin-top: 60px;
//             padding-top: 8px;
//             font-size: 12px;
//             font-weight: bold;
//           }

//           .footer {
//             margin-top: 40px;
//             text-align: center;
//             color: #666;
//             font-size: 10px;
//             border-top: 1px solid #ddd;
//             padding-top: 15px;
//           }
//           .jurisdiction { margin-top: 8px; font-size: 9px; color: #999; font-style: italic; }

//           @media print {
//             .invoice-page { padding: 15px; }
//             .signatures { margin-top: 60px; }
//           }
//         </style>
//       </head>
//       <body>
//         ${buildInvoiceHTML(totals, 'Original Copy')}
//         ${buildInvoiceHTML(totals, 'Duplicate Copy')}
//         <script>
//           window.onload = function() { window.print(); };
//         </script>
//       </body>
//       </html>
//     `;

//     printWindow.document.write(content);
//     printWindow.document.close();
//   };

//   const totals = calculateTotals();
//   const filteredHistory = invoiceHistory.filter(inv =>
//     inv.purchaserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     inv.invoiceNo.includes(searchTerm)
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
//       <div className="max-w-7xl mx-auto">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
//             <div className="border-b-4 border-yellow-600 pb-4 mb-6">
//               <h1 className="text-3xl font-bold text-gray-800">Gupta Jewels — Invoice Builder</h1>
//               <p className="text-gray-600">Premium billing UI • A4 PDF • Save &amp; Manage invoices</p>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Invoice No</label>
//                 <input type="text" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-600 focus:border-transparent" />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Purchaser Name</label>
//                 <input type="text" value={purchaserName} onChange={(e) => setPurchaserName(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-600 focus:border-transparent" />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
//                 <input type="tel" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)}
//                   placeholder="Enter phone number"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-600 focus:border-transparent" />
//               </div>
//             </div>

//             <div className="mb-6">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
//               <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-600 focus:border-transparent" />
//             </div>

//             <div className="mb-6">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
//               <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
//                 className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-600 focus:border-transparent" />
//               <p className="text-xs text-gray-500 mt-1">TIP: Auto-updates to today's date</p>
//             </div>

//             <div className="mb-6">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
//               <div className="flex gap-3">
//                 {['Cash', 'UPI', 'Card'].map(method => (
//                   <label key={method} className="flex items-center cursor-pointer">
//                     <input type="radio" name="paymentMethod" value={method}
//                       checked={paymentMethod === method} onChange={(e) => setPaymentMethod(e.target.value)}
//                       className="w-4 h-4 text-yellow-600 focus:ring-yellow-500" />
//                     <span className="ml-2 text-sm text-gray-700">{method}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>

//             <div className="mb-6">
//               <label className="flex items-center cursor-pointer">
//                 <input type="checkbox" checked={includeGST} onChange={(e) => setIncludeGST(e.target.checked)}
//                   className="w-4 h-4 text-yellow-600 focus:ring-yellow-500 rounded" />
//                 <span className="ml-2 text-sm text-gray-700">Include GST</span>
//               </label>
//             </div>

//             <div className="overflow-x-auto mb-4">
//               <table className="w-full border-collapse">
//                 <thead>
//                   <tr className="bg-gray-100">
//                     <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">S.No</th>
//                     <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Description</th>
//                     <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Purity</th>
//                     <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Rate/g</th>
//                     <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Weight</th>
//                     <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Making/g</th>
//                     <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Amount</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {items.map((item, idx) => (
//                     <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
//                       <td className="px-3 py-2 text-sm">{idx + 1}</td>
//                       <td className="px-3 py-2">
//                         <input type="text" value={item.description}
//                           onChange={(e) => updateItem(item.id, 'description', e.target.value)}
//                           className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-yellow-600"
//                           placeholder="Item name" />
//                       </td>
//                       <td className="px-3 py-2">
//                         <input type="text" value={item.purity}
//                           onChange={(e) => updateItem(item.id, 'purity', e.target.value)}
//                           className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-yellow-600"
//                           placeholder="Purity" />
//                       </td>
//                       <td className="px-3 py-2">
//                         <input type="number" value={item.rate}
//                           onChange={(e) => updateItem(item.id, 'rate', e.target.value)}
//                           className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-yellow-600"
//                           placeholder="0" />
//                       </td>
//                       <td className="px-3 py-2">
//                         <input type="number" value={item.weight}
//                           onChange={(e) => updateItem(item.id, 'weight', e.target.value)}
//                           className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-yellow-600"
//                           placeholder="0" />
//                       </td>
//                       <td className="px-3 py-2">
//                         <input type="number" value={item.making}
//                           onChange={(e) => updateItem(item.id, 'making', e.target.value)}
//                           className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-yellow-600"
//                           placeholder="0" />
//                       </td>
//                       <td className="px-3 py-2 text-sm font-semibold">₹{item.amount.toFixed(2)}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             <div className="flex flex-wrap gap-3 mb-4">
//               <button onClick={addItem}
//                 className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
//                 <Plus size={18} /> Add item
//               </button>
//               <button onClick={removeLastItem}
//                 className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
//                 <Trash2 size={18} /> Remove last
//               </button>
//               <button onClick={recalculate}
//                 className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
//                 <Calculator size={18} /> Recalculate
//               </button>
//             </div>

//             <div className="flex flex-wrap gap-3">
//               <button onClick={() => saveInvoice(false)}
//                 className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
//                 <Save size={18} /> Save Invoice
//               </button>
//               <button onClick={() => saveInvoice(true)}
//                 className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
//                 <FileText size={18} /> Save as New
//               </button>
//               <button onClick={exportPDF}
//                 className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
//                 <Download size={18} /> Export PDF
//               </button>
//             </div>

//             <p className="text-sm text-gray-600 mt-4">
//               Exporting PDF will open a print dialog with <strong>2 pages</strong> — Page 1: <em>Original Copy</em> (for customer), Page 2: <em>Duplicate Copy</em> (for your records).
//             </p>
//           </div>

//           <div className="space-y-6">
//             <div className="bg-white rounded-lg shadow-lg p-6">
//               <h2 className="text-xl font-bold text-gray-800 mb-2">Summary</h2>
//               <p className="text-sm text-gray-600 mb-4">Auto-calculated totals</p>
//               <div className="space-y-3">
//                 <div className="flex justify-between">
//                   <span className="text-gray-700">Total</span>
//                   <span className="font-semibold">₹{totals.total.toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-700">CGST (1.5%)</span>
//                   <span className="font-semibold">₹{totals.cgst.toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-700">SGST (1.5%)</span>
//                   <span className="font-semibold">₹{totals.sgst.toFixed(2)}</span>
//                 </div>
//                 <div className="border-t-2 border-yellow-800 pt-3 flex justify-between">
//                   <span className="text-lg font-bold text-yellow-800">Grand Total</span>
//                   <span className="text-lg font-bold text-yellow-800">₹{totals.grandTotal.toFixed(2)}</span>
//                 </div>
//               </div>

//               <div className="space-y-2 mt-4">
//                 <button onClick={clearAll}
//                   className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md transition-colors">
//                   Clear All
//                 </button>
//                 <button onClick={exportAllToExcel}
//                   className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 transition-colors">
//                   <FileSpreadsheet size={18} /> Export All to Excel
//                 </button>
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow-lg p-6">
//               <h2 className="text-xl font-bold text-gray-800 mb-4">Invoice History</h2>
//               <div className="relative mb-4">
//                 <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
//                 <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
//                   placeholder="Search by purchaser or invoice#"
//                   className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-600 focus:border-transparent" />
//               </div>

//               <div className="space-y-3 max-h-96 overflow-y-auto">
//                 {filteredHistory.length === 0 ? (
//                   <p className="text-gray-500 text-sm text-center py-4">No invoices saved yet</p>
//                 ) : (
//                   filteredHistory.map((inv) => (
//                     <div key={inv.invoiceNo} className="border border-gray-200 rounded-md p-3 hover:bg-gray-50 transition-colors">
//                       <div className="flex justify-between items-start mb-2">
//                         <div>
//                           <p className="font-semibold text-gray-800">#{inv.invoiceNo}</p>
//                           <p className="text-sm text-gray-600">{inv.purchaserName}</p>
//                           <p className="text-xs text-gray-500">{new Date(inv.date).toLocaleDateString()}</p>
//                           <p className="text-xs text-blue-600 font-medium">{inv.paymentMethod || 'Cash'}</p>
//                         </div>
//                         <p className="font-bold text-yellow-600">₹{inv.grandTotal.toFixed(2)}</p>
//                       </div>
//                       <div className="flex gap-2">
//                         <button onClick={() => loadInvoice(inv)}
//                           className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-3 py-1 rounded transition-colors">
//                           Load
//                         </button>
//                         <button onClick={() => duplicateInvoice(inv)}
//                           className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded transition-colors flex items-center gap-1">
//                           <Copy size={12} />
//                         </button>
//                         <button onClick={() => deleteInvoice(inv.invoiceNo)}
//                           className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded transition-colors">
//                           <X size={14} />
//                         </button>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;







// import './storage';
// import React, { useState, useEffect, useCallback } from 'react';
// import { Plus, Trash2, Calculator, Save, FileText, Download, Search, X, Copy, FileSpreadsheet } from 'lucide-react';

// function App() {
//   const [invoiceNo, setInvoiceNo] = useState('12');
//   const [purchaserName, setPurchaserName] = useState('Deepak');
//   const [address, setAddress] = useState('Purani Bazazi');
//   const [contactNumber, setContactNumber] = useState('');
//   const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
//   const [paymentMethod, setPaymentMethod] = useState('Cash');
//   const [includeGST, setIncludeGST] = useState(true);
//   const [items, setItems] = useState([]);
//   const [invoiceHistory, setInvoiceHistory] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');

//   useEffect(() => {
//     loadInvoiceHistory();
//   }, []);

//   const loadInvoiceHistory = async () => {
//     try {
//       const keys = await window.storage.list('invoice:');
//       if (keys && keys.keys) {
//         const invoices = [];
//         for (const key of keys.keys) {
//           try {
//             const result = await window.storage.get(key);
//             if (result) {
//               invoices.push(JSON.parse(result.value));
//             }
//           } catch (e) {
//             console.error('Error loading invoice:', e);
//           }
//         }
//         setInvoiceHistory(invoices.sort((a, b) => new Date(b.date) - new Date(a.date)));
//       }
//     } catch (error) {
//       console.error('Error loading history:', error);
//     }
//   };

//   const addItem = () => {
//     setItems([...items, {
//       id: Date.now(),
//       description: '',
//       purity: '',
//       rate: 0,
//       weight: 0,
//       making: 0,
//       amount: 0
//     }]);
//   };

//   const removeLastItem = () => {
//     if (items.length > 0) {
//       setItems(items.slice(0, -1));
//     }
//   };

//   const updateItem = useCallback((id, field, value) => {
//     setItems(prevItems => prevItems.map(item => {
//       if (item.id === id) {
//         const updatedItem = { ...item };
//         if (field === 'description' || field === 'purity') {
//           updatedItem[field] = value;
//         } else {
//           updatedItem[field] = parseFloat(value) || 0;
//         }
//         updatedItem.amount = (updatedItem.rate + updatedItem.making) * updatedItem.weight;
//         return updatedItem;
//       }
//       return item;
//     }));
//   }, []);

//   const recalculate = () => {
//     setItems(prevItems => prevItems.map(item => ({
//       ...item,
//       amount: (item.rate + item.making) * item.weight
//     })));
//   };

//   const calculateTotals = useCallback(() => {
//     const total = items.reduce((sum, item) => sum + item.amount, 0);
//     const cgst = total * 0.015;
//     const sgst = total * 0.015;
//     const grandTotal = total + cgst + sgst;
//     return { total, cgst, sgst, grandTotal };
//   }, [items]);

//   const saveInvoice = async (saveAsNew = false) => {
//     const totals = calculateTotals();
//     const invoice = {
//       invoiceNo: saveAsNew ? `${Date.now()}` : invoiceNo,
//       purchaserName,
//       address,
//       contactNumber,
//       date,
//       paymentMethod,
//       items,
//       ...totals,
//       savedAt: new Date().toISOString()
//     };

//     try {
//       await window.storage.set(`invoice:${invoice.invoiceNo}`, JSON.stringify(invoice));
//       await loadInvoiceHistory();
//       alert(`Invoice ${saveAsNew ? 'saved as new' : 'saved'} successfully!`);
//       if (saveAsNew) {
//         setInvoiceNo(invoice.invoiceNo);
//       }
//     } catch (error) {
//       console.error('Error saving invoice:', error);
//       alert('Failed to save invoice. Please try again.');
//     }
//   };

//   const loadInvoice = (invoice) => {
//     setInvoiceNo(invoice.invoiceNo);
//     setPurchaserName(invoice.purchaserName);
//     setAddress(invoice.address);
//     setContactNumber(invoice.contactNumber || '');
//     setDate(invoice.date);
//     setPaymentMethod(invoice.paymentMethod || 'Cash');
//     setItems(invoice.items);
//   };

//   const duplicateInvoice = (invoice) => {
//     const newInvoiceNo = `${Date.now()}`;
//     setInvoiceNo(newInvoiceNo);
//     setPurchaserName(invoice.purchaserName);
//     setAddress(invoice.address);
//     setContactNumber(invoice.contactNumber || '');
//     setDate(new Date().toISOString().split('T')[0]);
//     setPaymentMethod(invoice.paymentMethod || 'Cash');
//     setItems(invoice.items);
//     alert('Invoice duplicated! Update details and save.');
//   };

//   const deleteInvoice = async (invoiceNo) => {
//     if (window.confirm('Are you sure you want to delete this invoice?')) {
//       try {
//         await window.storage.delete(`invoice:${invoiceNo}`);
//         await loadInvoiceHistory();
//       } catch (error) {
//         console.error('Error deleting invoice:', error);
//       }
//     }
//   };

//   const clearAll = () => {
//     if (window.confirm('Clear all fields?')) {
//       setInvoiceNo('');
//       setPurchaserName('');
//       setAddress('');
//       setContactNumber('');
//       setDate(new Date().toISOString().split('T')[0]);
//       setPaymentMethod('Cash');
//       setItems([]);
//     }
//   };

//   const exportAllToExcel = () => {
//     if (invoiceHistory.length === 0) {
//       alert('No invoices to export!');
//       return;
//     }

//     let csvContent = 'Invoice No,Date,Customer Name,Contact Number,Address,Payment Method,Items Description,Total Weight (g),Total,CGST,SGST,Grand Total\n';
    
//     invoiceHistory.forEach(inv => {
//       const descriptions = inv.items.map(item => item.description).filter(d => d).join('; ') || 'N/A';
//       const totalWeight = inv.items.reduce((sum, item) => sum + (item.weight || 0), 0);
//       csvContent += `"${inv.invoiceNo}","${inv.date}","${inv.purchaserName}","${inv.contactNumber || 'N/A'}","${inv.address}","${inv.paymentMethod || 'Cash'}","${descriptions}",${totalWeight.toFixed(2)},${inv.total.toFixed(2)},${inv.cgst.toFixed(2)},${inv.sgst.toFixed(2)},${inv.grandTotal.toFixed(2)}\n`;
//     });

//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const link = document.createElement('a');
//     const url = URL.createObjectURL(blob);
//     link.setAttribute('href', url);
//     link.setAttribute('download', `All_Invoices_${new Date().toISOString().split('T')[0]}.csv`);
//     link.style.visibility = 'hidden';
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     alert(`Exported ${invoiceHistory.length} invoices to CSV/Excel!`);
//   };

//   // ─── Builds the inner HTML for one invoice copy ───────────────────────────
//   const buildInvoiceHTML = (totals, copyLabel) => `
//     <div class="invoice-page" style="position:relative;">

//       <!-- COPY LABEL — top-right corner, very small -->
//       <div style="
//         position: absolute;
//         top: 0px;
//         right: 0px;
//         font-family: Arial, sans-serif;
//         font-size: 8px;
//         font-weight: bold;
//         letter-spacing: 1.5px;
//         text-transform: uppercase;
//         color: #7a6010;
//         border: 1px solid #b8860b;
//         padding: 2px 7px;
//         border-radius: 2px;
//         background: #fffef8;
//       ">${copyLabel}</div>

//       <div class="top-info">
//         <div class="gst-number">${includeGST ? 'GST No: 10AKGPG7148B1ZS' : ''}</div>
//         <div class="company-phone">📞 +91-9472688888</div>
//       </div>

//       <div class="header">
//         ${includeGST ? '' : '<div class="estimate-title">Rough Estimate</div>'}
//         <div class="company-name">GUPTA JEWELS</div>
//         <div class="invoice-title">Prop. Manoj Kumar Gupta</div>
//         <div class="company-address">Purani Bajaji Gali, Siwan, Bihar- 841226</div>
//       </div>

//       <div class="info-section">
//         <div class="info-block">
//           <div class="info-label">Purchaser Name</div>
//           <div class="info-value">${purchaserName}</div>
//           <div class="info-label">Contact Number</div>
//           <div class="info-value">${contactNumber || 'N/A'}</div>
//           <div class="info-label">Address</div>
//           <div class="info-value">${address}</div>
//         </div>
//         <div class="info-block">
//           <div class="info-label">Invoice No</div>
//           <div class="info-value">${invoiceNo}</div>
//           <div class="info-label">Date</div>
//           <div class="info-value">${new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
//           <div class="info-label">Payment Method</div>
//           <div class="info-value">${paymentMethod}</div>
//         </div>
//       </div>

//       <table>
//         <thead>
//           <tr>
//             <th style="width:40px;">S.No</th>
//             <th>Description</th>
//             <th style="width:60px;">Purity</th>
//             <th style="width:80px;">Rate/g</th>
//             <th style="width:70px;">Weight</th>
//             <th style="width:80px;">Making/g</th>
//             <th style="width:90px;">Amount</th>
//           </tr>
//         </thead>
//         <tbody>
//           ${items.map((item, idx) => `
//             <tr>
//               <td style="text-align:center;">${idx + 1}</td>
//               <td><strong>${item.description}</strong></td>
//               <td>${item.purity || ''}</td>
//               <td>₹${(item.rate || 0).toFixed(2)}</td>
//               <td>${(item.weight || 0).toFixed(2)}g</td>
//               <td>₹${(item.making || 0).toFixed(2)}</td>
//               <td style="text-align:right;"><strong>₹${(item.amount || 0).toFixed(2)}</strong></td>
//             </tr>
//           `).join('')}
//           <tr class="totals-row">
//             <td colspan="6" style="text-align:right;">Subtotal:</td>
//             <td style="text-align:right;"><strong>₹${totals.total.toFixed(2)}</strong></td>
//           </tr>
//           <tr class="totals-row">
//             <td colspan="6" style="text-align:right;">CGST (1.5%):</td>
//             <td style="text-align:right;">₹${totals.cgst.toFixed(2)}</td>
//           </tr>
//           <tr class="totals-row">
//             <td colspan="6" style="text-align:right;">SGST (1.5%):</td>
//             <td style="text-align:right;">₹${totals.sgst.toFixed(2)}</td>
//           </tr>
//           <tr class="grand-total-row">
//             <td colspan="6" style="text-align:right;">GRAND TOTAL:</td>
//             <td style="text-align:right;">₹${totals.grandTotal.toFixed(2)}</td>
//           </tr>
//         </tbody>
//       </table>

//       <div class="signatures">
//         <div class="signature-box">
//           <div class="signature-line">Customer Signature</div>
//         </div>
//         <div class="signature-box">
//           <div class="signature-line">Authorized Signatory<br/>For Gupta Jewels</div>
//         </div>
//       </div>

//       <div class="footer">
//         <p style="margin-bottom:5px;">Please note that the net amount includes gold value, cost of stone, product making charges, wastage, GST &amp; other taxes</p>
//         <p>This is a computer-generated invoice</p>
//         <p class="jurisdiction">SUBJECT TO SIWAN JURISDICTION ONLY</p>
//       </div>
//     </div>
//   `;

//   // ─── Export PDF: prints BOTH copies on one page (page-break between them) ──
//   const exportPDF = () => {
//     const totals = calculateTotals();
//     const printWindow = window.open('', '_blank');

//     const content = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="UTF-8"/>
//         <title>Invoice ${invoiceNo} — ${purchaserName}</title>
//         <style>
//           * { margin: 0; padding: 0; box-sizing: border-box; }
//           body {
//             font-family: Arial, sans-serif;
//             color: #333;
//             background: #fff;
//           }

//           /* Each copy sits on its own printed page */
//           .invoice-page {
//             padding: 30px;
//             page-break-after: always;
//           }
//           .invoice-page:last-child {
//             page-break-after: avoid;
//           }

//           .top-info {
//             display: flex;
//             justify-content: space-between;
//             align-items: flex-start;
//             margin-bottom: 10px;
//             font-size: 11px;
//           }
//           .gst-number { font-weight: bold; color: #666; }
//           .company-phone { font-weight: bold; color: #b8860b; }

//           .header {
//             text-align: center;
//             margin-bottom: 25px;
//             border-bottom: 3px solid #b8860b;
//             padding-bottom: 15px;
//           }
//           .company-name {
//             font-size: 36px;
//             font-weight: bold;
//             color: #b8860b;
//             margin-bottom: 3px;
//             letter-spacing: 2px;
//           }
//           .company-address { font-size: 14px; color: #666; margin-bottom: 8px; }
//           .invoice-title { font-size: 18px; color: #666; margin-top: 8px; font-weight: bold; }
//           .estimate-title {
//             font-size: 10px;
//             color: #b8860b;
//             font-weight: bold;
//             text-transform: uppercase;
//             letter-spacing: 1px;
//           }

//           .info-section {
//             display: flex;
//             justify-content: space-between;
//             margin: 25px 0;
//             background: #f9f9f9;
//             padding: 15px;
//             border-radius: 5px;
//           }
//           .info-block { flex: 1; }
//           .info-label {
//             font-weight: bold;
//             color: #666;
//             font-size: 11px;
//             text-transform: uppercase;
//             margin-top: 8px;
//           }
//           .info-label:first-child { margin-top: 0; }
//           .info-value { font-size: 14px; margin-top: 3px; margin-bottom: 8px; color: #333; }

//           table { width: 100%; border-collapse: collapse; margin: 20px 0 0 0; border: 1px solid #ddd; }
//           th {
//             background: #b8860b;
//             color: white;
//             padding: 10px 8px;
//             text-align: left;
//             font-weight: bold;
//             font-size: 12px;
//             border: 1px solid #a07a0a;
//           }
//           td { padding: 8px; border: 1px solid #ddd; font-size: 12px; }
//           tr:nth-child(even) { background: #f9f9f9; }

//           .totals-row { background: #fffef8; }
//           .totals-row td { padding: 10px; font-size: 13px; font-weight: 600; }
//           .grand-total-row { background: #b8860b; }
//           .grand-total-row td {
//             padding: 12px 10px;
//             font-size: 16px;
//             font-weight: bold;
//             color: Black;
//             border: 1px solid #a07a0a;
//           }

//           .signatures {
//             margin-top: 80px;
//             display: flex;
//             justify-content: space-between;
//             padding: 0 30px;
//           }
//           .signature-box { text-align: center; }
//           .signature-line {
//             border-top: 1px solid #333;
//             margin-top: 60px;
//             padding-top: 8px;
//             font-size: 12px;
//             font-weight: bold;
//           }

//           .footer {
//             margin-top: 40px;
//             text-align: center;
//             color: #666;
//             font-size: 10px;
//             border-top: 1px solid #ddd;
//             padding-top: 15px;
//           }
//           .jurisdiction { margin-top: 8px; font-size: 9px; color: #999; font-style: italic; }

//           @media print {
//             .invoice-page { padding: 15px; }
//             .signatures { margin-top: 60px; }
//           }
//         </style>
//       </head>
//       <body>
//         ${buildInvoiceHTML(totals, 'Original Copy')}
//         ${buildInvoiceHTML(totals, 'Duplicate Copy')}
//         <script>
//           window.onload = function() { window.print(); };
//         </script>
//       </body>
//       </html>
//     `;

//     printWindow.document.write(content);
//     printWindow.document.close();
//   };

//   const totals = calculateTotals();
//   const filteredHistory = invoiceHistory.filter(inv =>
//     inv.purchaserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     inv.invoiceNo.includes(searchTerm)
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
//       <div className="max-w-7xl mx-auto">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
//             <div className="border-b-4 border-yellow-600 pb-4 mb-6">
//               <h1 className="text-3xl font-bold text-gray-800">Gupta Jewels — Invoice Builder</h1>
//               <p className="text-gray-600">Premium billing UI • A4 PDF • Save &amp; Manage invoices</p>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Invoice No</label>
//                 <input type="text" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-600 focus:border-transparent" />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Purchaser Name</label>
//                 <input type="text" value={purchaserName} onChange={(e) => setPurchaserName(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-600 focus:border-transparent" />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
//                 <input type="tel" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)}
//                   placeholder="Enter phone number"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-600 focus:border-transparent" />
//               </div>
//             </div>

//             <div className="mb-6">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
//               <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-600 focus:border-transparent" />
//             </div>

//             <div className="mb-6">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
//               <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
//                 className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-600 focus:border-transparent" />
//               <p className="text-xs text-gray-500 mt-1">TIP: Auto-updates to today's date</p>
//             </div>

//             <div className="mb-6">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
//               <div className="flex gap-3">
//                 {['Cash', 'UPI', 'Card'].map(method => (
//                   <label key={method} className="flex items-center cursor-pointer">
//                     <input type="radio" name="paymentMethod" value={method}
//                       checked={paymentMethod === method} onChange={(e) => setPaymentMethod(e.target.value)}
//                       className="w-4 h-4 text-yellow-600 focus:ring-yellow-500" />
//                     <span className="ml-2 text-sm text-gray-700">{method}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>

//             <div className="mb-6">
//               <label className="flex items-center cursor-pointer">
//                 <input type="checkbox" checked={includeGST} onChange={(e) => setIncludeGST(e.target.checked)}
//                   className="w-4 h-4 text-yellow-600 focus:ring-yellow-500 rounded" />
//                 <span className="ml-2 text-sm text-gray-700">Include GST</span>
//               </label>
//             </div>

//             <div className="overflow-x-auto mb-4">
//               <table className="w-full border-collapse">
//                 <thead>
//                   <tr className="bg-gray-100">
//                     <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">S.No</th>
//                     <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Description</th>
//                     <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Purity</th>
//                     <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Rate/g</th>
//                     <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Weight</th>
//                     <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Making/g</th>
//                     <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Amount</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {items.map((item, idx) => (
//                     <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
//                       <td className="px-3 py-2 text-sm">{idx + 1}</td>
//                       <td className="px-3 py-2">
//                         <input type="text" value={item.description}
//                           onChange={(e) => updateItem(item.id, 'description', e.target.value)}
//                           className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-yellow-600"
//                           placeholder="Item name" />
//                       </td>
//                       <td className="px-3 py-2">
//                         <input type="text" value={item.purity}
//                           onChange={(e) => updateItem(item.id, 'purity', e.target.value)}
//                           className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-yellow-600"
//                           placeholder="Purity" />
//                       </td>
//                       <td className="px-3 py-2">
//                         <input type="number" value={item.rate}
//                           onChange={(e) => updateItem(item.id, 'rate', e.target.value)}
//                           className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-yellow-600"
//                           placeholder="0" />
//                       </td>
//                       <td className="px-3 py-2">
//                         <input type="number" value={item.weight}
//                           onChange={(e) => updateItem(item.id, 'weight', e.target.value)}
//                           className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-yellow-600"
//                           placeholder="0" />
//                       </td>
//                       <td className="px-3 py-2">
//                         <input type="number" value={item.making}
//                           onChange={(e) => updateItem(item.id, 'making', e.target.value)}
//                           className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-yellow-600"
//                           placeholder="0" />
//                       </td>
//                       <td className="px-3 py-2 text-sm font-semibold">₹{item.amount.toFixed(2)}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             <div className="flex flex-wrap gap-3 mb-4">
//               <button onClick={addItem}
//                 className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
//                 <Plus size={18} /> Add item
//               </button>
//               <button onClick={removeLastItem}
//                 className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
//                 <Trash2 size={18} /> Remove last
//               </button>
//               <button onClick={recalculate}
//                 className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
//                 <Calculator size={18} /> Recalculate
//               </button>
//             </div>

//             <div className="flex flex-wrap gap-3">
//               <button onClick={() => saveInvoice(false)}
//                 className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
//                 <Save size={18} /> Save Invoice
//               </button>
//               <button onClick={() => saveInvoice(true)}
//                 className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
//                 <FileText size={18} /> Save as New
//               </button>
//               <button onClick={exportPDF}
//                 className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
//                 <Download size={18} /> Export PDF
//               </button>
//             </div>

//             <p className="text-sm text-gray-600 mt-4">
//               Exporting PDF will open a print dialog with <strong>2 pages</strong> — Page 1: <em>Original Copy</em> (for customer), Page 2: <em>Duplicate Copy</em> (for your records).
//             </p>
//           </div>

//           <div className="space-y-6">
//             <div className="bg-white rounded-lg shadow-lg p-6">
//               <h2 className="text-xl font-bold text-gray-800 mb-2">Summary</h2>
//               <p className="text-sm text-gray-600 mb-4">Auto-calculated totals</p>
//               <div className="space-y-3">
//                 <div className="flex justify-between">
//                   <span className="text-gray-700">Total</span>
//                   <span className="font-semibold">₹{totals.total.toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-700">CGST (1.5%)</span>
//                   <span className="font-semibold">₹{totals.cgst.toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-700">SGST (1.5%)</span>
//                   <span className="font-semibold">₹{totals.sgst.toFixed(2)}</span>
//                 </div>
//                 <div className="border-t-2 border-yellow-800 pt-3 flex justify-between">
//                   <span className="text-lg font-bold text-yellow-800">Grand Total</span>
//                   <span className="text-lg font-bold text-yellow-800">₹{totals.grandTotal.toFixed(2)}</span>
//                 </div>
//               </div>

//               <div className="space-y-2 mt-4">
//                 <button onClick={clearAll}
//                   className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md transition-colors">
//                   Clear All
//                 </button>
//                 <button onClick={exportAllToExcel}
//                   className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 transition-colors">
//                   <FileSpreadsheet size={18} /> Export All to Excel
//                 </button>
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow-lg p-6">
//               <h2 className="text-xl font-bold text-gray-800 mb-4">Invoice History</h2>
//               <div className="relative mb-4">
//                 <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
//                 <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
//                   placeholder="Search by purchaser or invoice#"
//                   className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-600 focus:border-transparent" />
//               </div>

//               <div className="space-y-3 max-h-96 overflow-y-auto">
//                 {filteredHistory.length === 0 ? (
//                   <p className="text-gray-500 text-sm text-center py-4">No invoices saved yet</p>
//                 ) : (
//                   filteredHistory.map((inv) => (
//                     <div key={inv.invoiceNo} className="border border-gray-200 rounded-md p-3 hover:bg-gray-50 transition-colors">
//                       <div className="flex justify-between items-start mb-2">
//                         <div>
//                           <p className="font-semibold text-gray-800">#{inv.invoiceNo}</p>
//                           <p className="text-sm text-gray-600">{inv.purchaserName}</p>
//                           <p className="text-xs text-gray-500">{new Date(inv.date).toLocaleDateString()}</p>
//                           <p className="text-xs text-blue-600 font-medium">{inv.paymentMethod || 'Cash'}</p>
//                         </div>
//                         <p className="font-bold text-yellow-600">₹{inv.grandTotal.toFixed(2)}</p>
//                       </div>
//                       <div className="flex gap-2">
//                         <button onClick={() => loadInvoice(inv)}
//                           className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-3 py-1 rounded transition-colors">
//                           Load
//                         </button>
//                         <button onClick={() => duplicateInvoice(inv)}
//                           className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded transition-colors flex items-center gap-1">
//                           <Copy size={12} />
//                         </button>
//                         <button onClick={() => deleteInvoice(inv.invoiceNo)}
//                           className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded transition-colors">
//                           <X size={14} />
//                         </button>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;









import './storage';
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Calculator, Save, FileText, Download, Search, X, Copy, FileSpreadsheet } from 'lucide-react';

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'gupta@123' && password === 'zxcvbnm@098') {
      onLogin();
    } else {
      setError('Invalid username or password. Please try again.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
      }}>

        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#b8860b',
            letterSpacing: '2px',
            marginBottom: '4px',
          }}>
            GUPTA JEWELS
          </div>
          <div style={{
            fontSize: '13px',
            color: '#888',
            marginBottom: '4px',
          }}>
            Prop. Manoj Kumar Gupta
          </div>
          <div style={{
            width: '60px',
            height: '3px',
            background: '#b8860b',
            margin: '12px auto 0',
            borderRadius: '2px',
          }} />
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#333', margin: 0 }}>
            Invoice Portal Login
          </h2>
          <p style={{ fontSize: '13px', color: '#999', marginTop: '6px' }}>
            Enter your credentials to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin}>

          {/* Username */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 'bold',
              color: '#555',
              marginBottom: '6px',
            }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              placeholder="Enter username"
              required
              style={{
                width: '100%',
                padding: '11px 14px',
                border: '1.5px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#b8860b'}
              onBlur={e => e.target.style.borderColor = '#ddd'}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '10px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 'bold',
              color: '#555',
              marginBottom: '6px',
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter password"
                required
                style={{
                  width: '100%',
                  padding: '11px 44px 11px 14px',
                  border: '1.5px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#b8860b'}
                onBlur={e => e.target.style.borderColor = '#ddd'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: '#999',
                  padding: '0',
                }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: '#fff5f5',
              border: '1px solid #fcc',
              color: '#c00',
              borderRadius: '6px',
              padding: '10px 14px',
              fontSize: '13px',
              marginBottom: '16px',
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '13px',
              background: 'linear-gradient(135deg, #b8860b, #d4a017)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: 'pointer',
              letterSpacing: '0.5px',
              marginTop: '8px',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => e.target.style.opacity = '0.9'}
            onMouseLeave={e => e.target.style.opacity = '1'}
          >
            Login →
          </button>

        </form>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          fontSize: '11px',
          color: '#bbb',
        }}>
          Purani Bajaji Gali, Siwan, Bihar — 841226
        </div>

      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Show login page if not logged in
  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return <InvoiceApp onLogout={() => setIsLoggedIn(false)} />;
}

// ─── INVOICE APP (your original code, untouched) ─────────────────────────────
function InvoiceApp({ onLogout }) {
  const [invoiceNo, setInvoiceNo] = useState('2026');
  const [purchaserName, setPurchaserName] = useState('Deepak');
  const [address, setAddress] = useState('Purani Bazazi');
  const [contactNumber, setContactNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [includeGST, setIncludeGST] = useState(true);
  const [items, setItems] = useState([]);
  const [invoiceHistory, setInvoiceHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadInvoiceHistory();
  }, []);

  const loadInvoiceHistory = async () => {
    try {
      const keys = await window.storage.list('invoice:');
      if (keys && keys.keys) {
        const invoices = [];
        for (const key of keys.keys) {
          try {
            const result = await window.storage.get(key);
            if (result) {
              invoices.push(JSON.parse(result.value));
            }
          } catch (e) {
            console.error('Error loading invoice:', e);
          }
        }
        setInvoiceHistory(invoices.sort((a, b) => new Date(b.date) - new Date(a.date)));
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const addItem = () => {
    setItems([...items, {
      id: Date.now(),
      description: '',
      purity: '',
      rate: '',
      weight: '',
      making: '',
      amount: 0
    }]);
  };

  const removeLastItem = () => {
    if (items.length > 0) {
      setItems(items.slice(0, -1));
    }
  };

  const updateItem = useCallback((id, field, value) => {
    setItems(prevItems => prevItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item };
        if (field === 'description' || field === 'purity') {
          updatedItem[field] = value;
        } else {
          updatedItem[field] = parseFloat(value) || 0;
        }
        updatedItem.amount = (updatedItem.rate + updatedItem.making) * updatedItem.weight;
        return updatedItem;
      }
      return item;
    }));
  }, []);

  const recalculate = () => {
    setItems(prevItems => prevItems.map(item => ({
      ...item,
      amount: (item.rate + item.making) * item.weight
    })));
  };

  const calculateTotals = useCallback(() => {
    const total = items.reduce((sum, item) => sum + item.amount, 0);
    const cgst = total * 0.015;
    const sgst = total * 0.015;
    const grandTotal = total + cgst + sgst;
    return { total, cgst, sgst, grandTotal };
  }, [items]);

  const saveInvoice = async (saveAsNew = false) => {
    const totals = calculateTotals();
    const invoice = {
      invoiceNo: invoiceNo,
      purchaserName,
      address,
      contactNumber,
      date,
      paymentMethod,
      items,
      ...totals,
      savedAt: new Date().toISOString()
    };

    try {
      await window.storage.set(`invoice:${invoice.invoiceNo}`, JSON.stringify(invoice));
      await loadInvoiceHistory();
      alert(`Invoice ${saveAsNew ? 'saved as new' : 'saved'} successfully!`);
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Failed to save invoice. Please try again.');
    }
  };

  const loadInvoice = (invoice) => {
    setInvoiceNo(invoice.invoiceNo);
    setPurchaserName(invoice.purchaserName);
    setAddress(invoice.address);
    setContactNumber(invoice.contactNumber || '');
    setDate(invoice.date);
    setPaymentMethod(invoice.paymentMethod || 'Cash');
    setItems(invoice.items);
  };

  const duplicateInvoice = (invoice) => {
    setInvoiceNo(invoice.invoiceNo);
    setPurchaserName(invoice.purchaserName);
    setAddress(invoice.address);
    setContactNumber(invoice.contactNumber || '');
    setDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod(invoice.paymentMethod || 'Cash');
    setItems(invoice.items);
    alert('Invoice duplicated! Update Invoice No if needed, then save.');
  };

  const deleteInvoice = async (invoiceNo) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await window.storage.delete(`invoice:${invoiceNo}`);
        await loadInvoiceHistory();
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    }
  };

  const clearAll = () => {
    if (window.confirm('Clear all fields?')) {
      setInvoiceNo('');
      setPurchaserName('');
      setAddress('');
      setContactNumber('');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('Cash');
      setItems([]);
    }
  };

  const exportAllToExcel = () => {
    if (invoiceHistory.length === 0) {
      alert('No invoices to export!');
      return;
    }

    let csvContent = 'Invoice No,Date,Customer Name,Contact Number,Address,Items Description,Total Weight (g),Total,CGST,SGST,Grand Total\n';
    
    invoiceHistory.forEach(inv => {
      const descriptions = inv.items.map(item => item.description).filter(d => d).join('; ') || 'N/A';
      const totalWeight = inv.items.reduce((sum, item) => sum + (item.weight || 0), 0);
      csvContent += `"${inv.invoiceNo}","${inv.date}","${inv.purchaserName}","${inv.contactNumber || 'N/A'}","${inv.address}","${inv.paymentMethod || 'Cash'}","${descriptions}",${totalWeight.toFixed(2)},${inv.total.toFixed(2)},${inv.cgst.toFixed(2)},${inv.sgst.toFixed(2)},${inv.grandTotal.toFixed(2)}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `All_Invoices_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert(`Exported ${invoiceHistory.length} invoices to CSV/Excel!`);
  };

  // ─── ADDITION 1: Number to Words — Indian system (Lakh / Crore) ──────────
  const numberToWords = (amount) => {
    const ones = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
      'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const numToWord = (n) => {
      if (n === 0) return '';
      if (n < 20) return ones[n] + ' ';
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '') + ' ';
      if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred ' + numToWord(n % 100);
      if (n < 100000) return numToWord(Math.floor(n / 1000)) + 'Thousand ' + numToWord(n % 1000);
      if (n < 10000000) return numToWord(Math.floor(n / 100000)) + 'Lakh ' + numToWord(n % 100000);
      return numToWord(Math.floor(n / 10000000)) + 'Crore ' + numToWord(n % 10000000);
    };

    const rupees = Math.floor(amount);
    const paise = Math.round((amount - rupees) * 100);
    let words = 'Rupees ' + (numToWord(rupees).trim() || 'Zero');
    if (paise > 0) words += ' and ' + numToWord(paise).trim() + ' Paise';
    return words + ' Only';
  };

  // ─── Builds the inner HTML for one invoice copy ───────────────────────────
  const buildInvoiceHTML = (totals, copyLabel) => `
    <div class="invoice-page">

      <!-- Full Page Watermark -->
      <div class="wm-wrap">
        <img class="wm-img" src="data:image/jpeg;base64,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" alt="" />
      </div>
      <!-- Top bar — GST left | Phone right -->
      <div class="top-bar">
        <div class="gst-number">${includeGST ? 'GST No: 10AKGPG7148B1ZS' : ''}</div>
        <div class="company-phone">📞 +91-9472688888</div>
      </div>

      <div class="header">
        ${includeGST ? '<div class="tax-invoice-title">TAX INVOICE</div>' : '<div class="estimate-title">Rough Estimate</div>'}
        <div class="company-name">GUPTA JEWELS</div>
        <div class="invoice-title">Prop. Manoj Kumar Gupta</div>
        <div class="company-address">Purani Bajaji Gali, Siwan, Bihar- 841226</div>
      </div>

      <div class="info-section">
        <div class="info-block">
          <div class="info-label">Purchaser Name</div>
          <div class="info-value">${purchaserName}</div>
          <div class="info-label">Contact Number</div>
          <div class="info-value">${contactNumber || 'N/A'}</div>
          <div class="info-label">Address</div>
          <div class="info-value">${address}</div>
        </div>
        <div class="info-block">
          ${includeGST ? `<div class="info-label">Invoice No</div><div class="info-value">${invoiceNo}</div>` : ''}
          <div class="info-label">Date</div>
          <div class="info-value">${new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
        
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width:40px;">S.No</th>
            <th>Description</th>
            <th style="width:60px;">Purity</th>
            <th style="width:80px;">Rate/g</th>
            <th style="width:70px;">Weight</th>
            <th style="width:80px;">Making/g</th>
            <th style="width:110px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item, idx) => `
            <tr>
              <td style="text-align:center;">${idx + 1}</td>
              <td><strong>${item.description}</strong></td>
              <td>${item.purity || ''}</td>
              <td>₹${(item.rate || 0).toFixed(2)}</td>
              <td>${(item.weight || 0).toFixed(2)}g</td>
              <td>₹${(item.making || 0).toFixed(2)}</td>
              <td style="text-align:right;"><strong>₹${(item.amount || 0).toFixed(2)}</strong></td>
            </tr>
          `).join('')}
          <tr class="totals-row">
            <td colspan="6" style="text-align:right;">Subtotal:</td>
            <td style="text-align:right;"><strong>₹${totals.total.toFixed(2)}</strong></td>
          </tr>
          <tr class="totals-row">
            <td colspan="6" style="text-align:right;">CGST (1.5%):</td>
            <td style="text-align:right;">₹${totals.cgst.toFixed(2)}</td>
          </tr>
          <tr class="totals-row">
            <td colspan="6" style="text-align:right;">SGST (1.5%):</td>
            <td style="text-align:right;">₹${totals.sgst.toFixed(2)}</td>
          </tr>
          <tr class="grand-total-row">
            <td colspan="6" style="text-align:right;">GRAND TOTAL:</td>
            <td style="text-align:right;">₹${totals.grandTotal.toFixed(2)}</td>
          </tr>
          <!-- ADDITION 3: Amount in Words row -->
          <tr class="words-row">
            <td colspan="7">
              <strong>Amount in Words:</strong> ${numberToWords(totals.grandTotal)}
            </td>
          </tr>
          ${includeGST ? `<tr class="payment-row">
            <td colspan="3" style="border-right: 2px solid #b8860b; width:50%;">
              <strong>Cash:</strong> 
            </td>
            <td colspan="4" style="width:50%;">
              <strong>Bank / Cheque:</strong> 
            </td>
          </tr>` : ''}
        </tbody>
      </table>

      <div class="signatures">
        <div class="signature-box">
          <div class="signature-line">Customer Signature</div>
        </div>
        <div class="signature-box">
          <div class="signature-line">Authorized Signatory<br/>For Gupta Jewels</div>
        </div>
      </div>

      <div class="footer">
        <p style="margin-bottom:5px;">Please note that the net amount includes gold value, cost of stone, product making charges, wastage, GST &amp; other taxes</p>
        ${includeGST ? `<p>This is a computer-generated invoice</p>
        <p class="jurisdiction">SUBJECT TO SIWAN JURISDICTION ONLY</p>` : ''}
      </div>
    </div>
  `;

  // ─── Export PDF: prints BOTH copies on one page (page-break between them) ──
  const exportPDF = () => {
    const totals = calculateTotals();
    const printWindow = window.open('', '_blank');

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8"/>
        <title>Invoice${invoiceNo}—${purchaserName}</title>
        <style>

          /* ── Reset ── */
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: Arial, sans-serif;
            color: #333;
            background: #fff;
          }

          /* ── Invoice Page ── */
          .invoice-page {
            position: relative;
            padding: 25px 28px;
            page-break-after: always;
          }

          .invoice-page:last-child {
            page-break-after: avoid;
          }

          /* ── Top Bar: GST left | Phone right ── */
          .top-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 7px;
            font-size: 11px;
            position: relative;
            z-index: 1;
          }

          .gst-number {
            font-weight: bold;
            color: #666;
          }

          .company-phone {
            font-weight: bold;
            color: #b8860b;
          }

          /* ── Company Header ── */
          .header {
            text-align: center;
            margin-bottom: 18px;
            border-bottom: 3px solid #b8860b;
            padding-bottom: 12px;
            position: relative;
            z-index: 1;
          }

          .company-name {
            font-size: 36px;
            font-weight: bold;
            color: #b8860b;
            margin-bottom: 3px;
            letter-spacing: 2px;
          }

          .company-address {
            font-size: 14px;
            color: #666;
            margin-bottom: 4px;
          }

          .invoice-title {
            font-size: 18px;
            color: #666;
            margin-top: 4px;
            font-weight: bold;
          }

          .estimate-title {
            font-size: 10px;
            color: #b8860b;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .tax-invoice-title {
            font-size: 14px;
            color: #b8860b;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 4px;
          }

          /* ── Info Section ── */
          .info-section {
            display: flex;
            justify-content: space-between;
            margin: 20px 0;
            background: transparent;
            padding: 13px;
            border-radius: 5px;
            position: relative;
            z-index: 1;
          }

          .info-block {
            flex: 1;
          }

          .info-label {
            font-weight: bold;
            color: #666;
            font-size: 10px;
            text-transform: uppercase;
            margin-top: 5px;
          }

          .info-label:first-child {
            margin-top: 0;
          }

          .info-value {
            font-size: 13px;
            margin-top: 1px;
            margin-bottom: 4px;
            color: #333;
          }

          /* ── Table ── */
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 8px 0 0 0;
            border: 1px solid #ddd;
            position: relative;
            z-index: 1;
            table-layout: fixed;
          }

          th {
            background: #b8860b;
            color: white;
            padding: 7px 6px;
            text-align: left;
            font-weight: bold;
            font-size: 11px;
            border: 1px solid #a07a0a;
            overflow: hidden;
          }

          td {
            padding: 8px;
            border: 1px solid #ddd;
            font-size: 11px;
            position: relative;
            z-index: 1;
            background: transparent;
            overflow: hidden;
            word-wrap: break-word;
          }

          tr:nth-child(even) {
            background: transparent;
          }

          /* ── Totals Rows ── */
          .totals-row {
            background: transparent;
          }

          .totals-row td {
            padding: 9px;
            font-size: 12px;
            font-weight: 600;
          }

          /* ── Grand Total Row ── */
          .grand-total-row {
            background: #b8860b;
          }

          .grand-total-row td {
            padding: 10px;
            font-size: 14px;
            font-weight: bold;
            color: Black;
            border: 1px solid #a07a0a;
          }

          /* ── Amount in Words Row ── */
          .words-row td {
            text-align: left;
            font-size: 11px;
            font-style: italic;
            color: #7a6010;
            background: transparent;
            border: 1px solid #e6d080;
            padding: 6px 10px;
            letter-spacing: 0.3px;
          }

          /* ── Cash / Bank Row ── */
          .payment-row td {
            font-size: 11px;
            color: #333;
            background: transparent;
            border: 1px solid #e6d080;
            padding: 7px 10px;
          }

          /* ── Signatures ── */
          .signatures {
            margin-top: 90px;
            display: flex;
            justify-content: space-between;
            padding: 0 30px;
          }

          .signature-box {
            text-align: center;
          }

          .signature-line {
            border-top: 1px solid #333;
            margin-top: 36px;
            padding-top: 6px;
            font-size: 11px;
            font-weight: bold;
          }

          /* ── Footer ── */
          .footer {
            margin-top: 10px;
            text-align: center;
            color: #666;
            font-size: 10px;
            border-top: 1px solid #ddd;
            padding-top: 8px;
          }

          .jurisdiction {
            margin-top: 4px;
            font-size: 9px;
            color: #999;
            font-style: italic;
          }

          /* ── Watermark ── */
          .wm-wrap {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 0;
            pointer-events: none;
          }

          .wm-img {
            width: 70%;
            max-width: 520px;
            opacity: 0.22;
          }

          /* ── Print overrides ── */
          @media print {
            .invoice-page {
              padding: 10px 20px;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .signatures {
              margin-top: 40px;
            }

            .wm-wrap {
              position: fixed !important;
              display: flex !important;
              opacity: 1 !important;
            }

            .wm-img {
              opacity: 0.11 !important;
              display: block !important;
            }
          }

        </style>
      </head>
      <body>
        ${buildInvoiceHTML(totals, 'Original Copy')}
        ${buildInvoiceHTML(totals, 'Duplicate Copy')}
        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
  };

  const totals = calculateTotals();
  const filteredHistory = invoiceHistory.filter(inv =>
    inv.purchaserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.invoiceNo.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">

        {/* ── Logout Button ── */}
        <div className="flex justify-end mb-3">
          <button
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-md transition-colors flex items-center gap-2"
          >
            <X size={15} /> Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
            <div className="border-b-4 border-yellow-600 pb-4 mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Gupta Jewels — Invoice Builder</h1>
              <p className="text-gray-600">Premium billing UI • A4 PDF •</p>
              {/* Save &amp; Manage invoices */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice No</label>
                <input type="text" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-600 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purchaser Name</label>
                <input type="text" value={purchaserName} onChange={(e) => setPurchaserName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-600 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <input type="tel" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-600 focus:border-transparent" />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-600 focus:border-transparent" />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-600 focus:border-transparent" />
              <p className="text-xs text-gray-500 mt-1">TIP: Auto-updates to today's date</p>
            </div>

        

            <div className="mb-6">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" checked={includeGST} onChange={(e) => setIncludeGST(e.target.checked)}
                  className="w-4 h-4 text-yellow-600 focus:ring-yellow-500 rounded" />
                <span className="ml-2 text-sm text-gray-700"></span>
              </label>
            </div>

            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">S.No</th>
                    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Description</th>
                    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Purity</th>
                    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Rate/g</th>
                    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Weight</th>
                    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Making/g</th>
                    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm">{idx + 1}</td>
                      <td className="px-3 py-2">
                        <input type="text" value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-yellow-600"
                          placeholder="Item name" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="text" value={item.purity}
                          onChange={(e) => updateItem(item.id, 'purity', e.target.value)}
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-yellow-600"
                          placeholder="Purity" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" value={item.rate}
                          onChange={(e) => updateItem(item.id, 'rate', e.target.value)}
                          className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-yellow-600"
                          placeholder="0" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" value={item.weight}
                          onChange={(e) => updateItem(item.id, 'weight', e.target.value)}
                          className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-yellow-600"
                          placeholder="0" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" value={item.making}
                          onChange={(e) => updateItem(item.id, 'making', e.target.value)}
                          className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-yellow-600"
                          placeholder="0" />
                      </td>
                      <td className="px-3 py-2 text-sm font-semibold">₹{item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap gap-3 mb-4">
              <button onClick={addItem}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
                <Plus size={18} /> Add item
              </button>
              <button onClick={removeLastItem}
                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
                <Trash2 size={18} /> Remove last
              </button>
              <button onClick={recalculate}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
                <Calculator size={18} /> Recalculate
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={() => saveInvoice(false)}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
                <Save size={18} /> Save Invoice
              </button>
              <button onClick={() => saveInvoice(true)}
                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
                <FileText size={18} /> Save as New
              </button>
              <button onClick={exportPDF}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
                <Download size={18} /> Export PDF
              </button>
            </div>

            <p className="text-sm text-gray-600 mt-4">
              Exporting PDF will open a print dialog with <strong>2 pages</strong> — Page 1: <em>Original Copy</em> (for customer), Page 2: <em>Duplicate Copy</em> (for your records).
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Summary</h2>
              <p className="text-sm text-gray-600 mb-4">Auto-calculated totals</p>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-700">Total</span>
                  <span className="font-semibold">₹{totals.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">CGST (1.5%)</span>
                  <span className="font-semibold">₹{totals.cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">SGST (1.5%)</span>
                  <span className="font-semibold">₹{totals.sgst.toFixed(2)}</span>
                </div>
                <div className="border-t-2 border-yellow-800 pt-3 flex justify-between">
                  <span className="text-lg font-bold text-yellow-800">Grand Total</span>
                  <span className="text-lg font-bold text-yellow-800">₹{totals.grandTotal.toFixed(2)}</span>
                </div>
                {/* ADDITION 4: Amount in words shown live in summary panel */}
                <div className="text-xs text-yellow-700 italic bg-yellow-50 rounded p-2 leading-relaxed">
                  {numberToWords(totals.grandTotal)}
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <button onClick={clearAll}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md transition-colors">
                  Clear All
                </button>
                <button onClick={exportAllToExcel}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 transition-colors">
                  <FileSpreadsheet size={18} /> Export All to Excel
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Invoice History</h2>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by purchaser or invoice#"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-600 focus:border-transparent" />
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredHistory.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No invoices saved yet</p>
                ) : (
                  filteredHistory.map((inv) => (
                    <div key={inv.invoiceNo} className="border border-gray-200 rounded-md p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-800">#{inv.invoiceNo}</p>
                          <p className="text-sm text-gray-600">{inv.purchaserName}</p>
                          <p className="text-xs text-gray-500">{new Date(inv.date).toLocaleDateString()}</p>
                          <p className="text-xs text-blue-600 font-medium">{inv.paymentMethod || 'Cash'}</p>
                        </div>
                        <p className="font-bold text-yellow-600">₹{inv.grandTotal.toFixed(2)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => loadInvoice(inv)}
                          className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-3 py-1 rounded transition-colors">
                          Load
                        </button>
                        <button onClick={() => duplicateInvoice(inv)}
                          className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded transition-colors flex items-center gap-1">
                          <Copy size={12} />
                        </button>
                        <button onClick={() => deleteInvoice(inv.invoiceNo)}
                          className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;