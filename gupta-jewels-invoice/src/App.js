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
          © 2026 Deepak Gupta — All rights reserved
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
      invoiceNo: saveAsNew ? `${Date.now()}` : invoiceNo,
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
      if (saveAsNew) {
        setInvoiceNo(invoice.invoiceNo);
      }
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
    const newInvoiceNo = `${Date.now()}`;
    setInvoiceNo(newInvoiceNo);
    setPurchaserName(invoice.purchaserName);
    setAddress(invoice.address);
    setContactNumber(invoice.contactNumber || '');
    setDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod(invoice.paymentMethod || 'Cash');
    setItems(invoice.items);
    alert('Invoice duplicated! Update details and save.');
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

    let csvContent = 'Invoice No,Date,Customer Name,Contact Number,Address,Payment Method,Items Description,Total Weight (g),Total,CGST,SGST,Grand Total\n';
    
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
          <div class="info-label">Invoice No</div>
          <div class="info-value">${invoiceNo}</div>
          <div class="info-label">Date</div>
          <div class="info-value">${new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
          <div class="info-label">Payment Method</div>
          <div class="info-value">${paymentMethod}</div>
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
            <th style="width:90px;">Amount</th>
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
        <p>This is a computer-generated invoice</p>
        <p class="jurisdiction">SUBJECT TO SIWAN JURISDICTION ONLY</p>
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
            background: #f9f9f9;
            padding: 13px;
            border-radius: 5px;
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
          }

          th {
            background: #b8860b;
            color: white;
            padding: 7px 6px;
            text-align: left;
            font-weight: bold;
            font-size: 11px;
            border: 1px solid #a07a0a;
          }

          td {
            padding: 8px;
            border: 1px solid #ddd;
            font-size: 11px;
          }

          tr:nth-child(even) {
            background: #f9f9f9;
          }

          /* ── Totals Rows ── */
          .totals-row {
            background: #fffef8;
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
            background: #fffef3;
            border: 1px solid #e6d080;
            padding: 6px 10px;
            letter-spacing: 0.3px;
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

          /* ── Print overrides ── */
          @media print {
            .invoice-page {
              padding: 10px 20px;
            }

            .signatures {
              margin-top: 40px;
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <div className="flex gap-3">
                {['Cash', 'UPI', 'Card'].map(method => (
                  <label key={method} className="flex items-center cursor-pointer">
                    <input type="radio" name="paymentMethod" value={method}
                      checked={paymentMethod === method} onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-yellow-600 focus:ring-yellow-500" />
                    <span className="ml-2 text-sm text-gray-700">{method}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" checked={includeGST} onChange={(e) => setIncludeGST(e.target.checked)}
                  className="w-4 h-4 text-yellow-600 focus:ring-yellow-500 rounded" />
                <span className="ml-2 text-sm text-gray-700">.</span>
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