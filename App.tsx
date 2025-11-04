import React, { useState, useMemo, useCallback, useRef } from 'react';
import { QuoteItem } from './types';
import Logo from './components/Logo';
import EditableField from './components/EditableField';

// These declarations are needed because jspdf and html2canvas are loaded from CDN
declare const jspdf: any;
declare const html2canvas: any;

const initialItems: QuoteItem[] = [
  {
    id: 1,
    description: 'Serviço de 02 Recepcionistas - Dia 27',
    quantity: 1,
    unitPrice: 460.00, // 2 recepcionistas * R$230,00
  },
  {
    id: 2,
    description: 'Serviço de 02 Recepcionistas - Dia 28',
    quantity: 1,
    unitPrice: 460.00, // 2 recepcionistas * R$230,00
  },
];

const App: React.FC = () => {
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [companyInfo, setCompanyInfo] = useState({
    name: 'TARHGET',
    address: 'Rua Armando Monteiro, 337 - Vila União',
    phone: '(11) 99999-8888',
    email: 'contato@tarhget.com',
  });
  const [clientInfo, setClientInfo] = useState({
    name: 'Rafael Custódio',
    address: 'Empresa: Pop trade',
    email: 'cliente@email.com',
  });
  const [quoteInfo, setQuoteInfo] = useState({
    number: `ORC-${new Date().getFullYear()}-001`,
    date: new Date().toLocaleDateString('pt-BR'),
  });
  const [items, setItems] = useState<QuoteItem[]>(initialItems);
  const [notes, setNotes] = useState(
    'O uniforme será fornecido pela empresa.\nHorário de trabalho: 11:00 às 16:00.\nValidade da proposta: 15 dias.'
  );
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };
  
  const handleUpdateItem = useCallback(<K extends keyof QuoteItem>(id: number, field: K, value: QuoteItem[K]) => {
      setItems(currentItems =>
          currentItems.map(item =>
              item.id === id ? { ...item, [field]: value } : item
          )
      );
  }, []);

  const { subtotal, total } = useMemo(() => {
    const sub = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    return { subtotal: sub, total: sub };
  }, [items]);
  
  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    const quoteElement = document.getElementById('quote-content');
    if (!quoteElement) {
        setIsGeneratingPdf(false);
        return;
    };

    const { jsPDF } = jspdf;
    
    // Give a bit of time for the loading state to render
    await new Promise(resolve => setTimeout(resolve, 100));

    const canvas = await html2canvas(quoteElement, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = imgWidth / imgHeight;
    const canvasPdfWidth = pdfWidth - 80; // with margin
    const canvasPdfHeight = canvasPdfWidth / ratio;

    pdf.addImage(imgData, 'PNG', 40, 40, canvasPdfWidth, canvasPdfHeight);
    pdf.save(`orcamento-${quoteInfo.number}.pdf`);
    setIsGeneratingPdf(false);
  };
  
  const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.707a1 1 0 011.414 0L9 11.086V3a1 1 0 112 0v8.086l1.293-1.379a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );

  return (
    <div className="bg-gray-100 min-h-screen font-sans text-brand-secondary p-4 sm:p-8">
      <div id="quote-content" className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg p-8 sm:p-12">
        <header className="flex flex-col sm:flex-row justify-between items-start pb-8 border-b-2 border-gray-100">
          <div 
            className="w-48 cursor-pointer group relative flex items-center justify-start h-24"
            onClick={handleLogoClick}
            role="button"
            aria-label="Alterar logo da empresa"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleLogoClick()}
          >
            {logoSrc ? (
              <img src={logoSrc} alt="Company Logo" className="max-w-full max-h-24 object-contain" />
            ) : (
              <Logo />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 flex items-center justify-center transition-opacity duration-300 rounded-lg">
                <p className="text-white opacity-0 group-hover:opacity-100 font-bold text-sm">Alterar Logo</p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleLogoChange}
              accept="image/png, image/jpeg, image/svg+xml"
              className="hidden"
              aria-hidden="true"
            />
          </div>

          <div className="text-right mt-4 sm:mt-0">
            <h1 className="text-3xl sm:text-4xl font-bold text-brand-primary uppercase">Orçamento</h1>
            <div className="mt-2 text-sm">
              <EditableField initialValue={quoteInfo.number} onSave={val => setQuoteInfo(q => ({...q, number: val}))} className="font-semibold"/>
              <EditableField initialValue={`Data: ${quoteInfo.date}`} onSave={val => setQuoteInfo(q => ({...q, date: val.replace('Data: ', '')}))} />
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-8 my-8">
          <div>
            <h2 className="text-sm font-bold text-gray-500 uppercase mb-2">DE</h2>
            <EditableField initialValue={companyInfo.name} onSave={val => setCompanyInfo(c => ({...c, name: val}))} className="font-bold text-lg"/>
            <EditableField initialValue={companyInfo.address} onSave={val => setCompanyInfo(c => ({...c, address: val}))} className="text-sm"/>
            <EditableField initialValue={companyInfo.phone} onSave={val => setCompanyInfo(c => ({...c, phone: val}))} className="text-sm"/>
            <EditableField initialValue={companyInfo.email} onSave={val => setCompanyInfo(c => ({...c, email: val}))} className="text-sm text-blue-600"/>
          </div>
          <div className="sm:text-right">
            <h2 className="text-sm font-bold text-gray-500 uppercase mb-2">PARA</h2>
            <EditableField initialValue={clientInfo.name} onSave={val => setClientInfo(c => ({...c, name: val}))} className="font-bold text-lg"/>
            <EditableField initialValue={clientInfo.address} onSave={val => setClientInfo(c => ({...c, address: val}))} className="text-sm"/>
            <EditableField initialValue={clientInfo.email} onSave={val => setClientInfo(c => ({...c, email: val}))} className="text-sm text-blue-600"/>
          </div>
        </section>

        <section className="mt-12">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-brand-primary text-white uppercase text-sm">
                <th className="p-3 rounded-l-lg">Descrição</th>
                <th className="p-3 text-center">Qtd.</th>
                <th className="p-3 text-right">Preço Unit.</th>
                <th className="p-3 text-right rounded-r-lg">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="p-3">
                    <EditableField initialValue={item.description} onSave={val => handleUpdateItem(item.id, 'description', val)} className="font-semibold"/>
                  </td>
                  <td className="p-3 text-center">
                    <EditableField initialValue={String(item.quantity)} onSave={val => handleUpdateItem(item.id, 'quantity', Number(val) || 0)} />
                  </td>
                  <td className="p-3 text-right">
                     <EditableField initialValue={item.unitPrice.toFixed(2).replace('.',',')} onSave={val => handleUpdateItem(item.id, 'unitPrice', Number(val.replace(',','.')) || 0)} />
                  </td>
                  <td className="p-3 text-right font-semibold">{formatCurrency(item.quantity * item.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        
        <section className="flex justify-end mt-8">
            <div className="w-full sm:w-2/5">
                <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                </div>
                 <div className="flex justify-between items-center font-bold text-xl mt-4 pt-4 border-t-2 border-brand-primary text-brand-primary">
                    <span>Total</span>
                    <div className="text-right">
                        <span>{formatCurrency(total)}</span>
                        <small className="block text-xs font-normal text-gray-500">(NF Inclusa)</small>
                    </div>
                </div>
            </div>
        </section>

        <section className="mt-12">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Observações</h3>
            <EditableField initialValue={notes} onSave={setNotes} className="text-sm text-gray-600" isTextarea={true}/>
        </section>
        
        <footer className="mt-16 pt-8 border-t-2 border-gray-100 text-center text-sm text-gray-500">
            <p>Agradecemos a sua preferência!</p>
            <p className="mt-1">{companyInfo.name} | {companyInfo.email}</p>
        </footer>
      </div>

      <div className="no-print fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm shadow-top flex justify-center">
          <button 
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="bg-brand-primary text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-opacity-90 transition-all flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
              {isGeneratingPdf ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Gerando PDF...
                </>
              ) : (
                <>
                  <DownloadIcon />
                  Baixar em PDF
                </>
              )}
          </button>
      </div>

    </div>
  );
};

export default App;