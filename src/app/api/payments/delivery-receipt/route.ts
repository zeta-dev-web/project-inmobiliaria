import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import n2words from 'n2words';

export async function POST(req: NextRequest) {
  try {
    const { paymentIds } = await req.json();

    const payments = await prisma.payment.findMany({
      where: { id: { in: paymentIds } },
      include: {
        rental: {
          include: {
            property: true,
            tenants: {
              include: {
                client: true,
              },
            },
            landlord: true,
          },
        },
      },
      orderBy: { periodMonth: 'asc' },
    });

    if (!payments.length) {
      return NextResponse.json(
        { error: 'Pagos no encontrados' },
        { status: 404 }
      );
    }

    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const landlord = payments[0].rental.landlord;
    const property = payments[0].rental.property;
    const deliveryDate = payments[0].deliveryDate || new Date();
    const deliveryMethod = payments[0].deliveryMethod || 'efectivo';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Comprobante de Entrega</title>
  <style>
    @page { size: A4; margin: 0; }
    body { 
      font-family: Arial, sans-serif; 
      margin: 0;
      padding: 0;
    }
    .receipt {
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      box-sizing: border-box;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #600096;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #600096;
    }
    .title {
      text-align: center;
      font-size: 20px;
      font-weight: bold;
      color: #600096;
      margin-bottom: 30px;
    }
    .section {
      margin-bottom: 20px;
      font-size: 14px;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 12px;
    }
    .table th {
      background-color: #600096;
      color: white;
      padding: 8px;
      text-align: left;
    }
    .table td {
      border: 1px solid #ddd;
      padding: 8px;
    }
    .total {
      text-align: right;
      font-size: 16px;
      font-weight: bold;
      margin-top: 20px;
      color: #600096;
    }
    .signature {
      margin-top: 60px;
      text-align: center;
    }
    .signature-line {
      border-top: 1px solid #000;
      width: 250px;
      margin: 0 auto;
      padding-top: 5px;
      font-size: 12px;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      font-size: 10px;
      color: #666;
    }
    .actions {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-top: 20px;
      padding: 20px 0;
    }
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .btn-print {
      background-color: #600096;
      color: white;
    }
    .btn-print:hover {
      background-color: #500080;
    }
    .btn-download {
      background-color: #0ea5e9;
      color: white;
    }
    .btn-download:hover {
      background-color: #0284c7;
    }
    @media print {
      .actions { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <div style="display: flex; align-items: center; gap: 10px;">
        <img src="/favicon-32x32.png" alt="Logo" style="width: 32px; height: 32px;" />
        <div class="logo">POLAR INMOBILIARIA</div>
      </div>
      <div style="text-align: right; font-size: 11px; color: #666;">
        <div>Monteagudo 563, Local 2</div>
        <div>Tafí Viejo, Tucumán, Argentina</div>
      </div>
    </div>

    <div class="title">COMPROBANTE DE ENTREGA</div>

    <div class="section" style="text-align: right;">
      <div>Fecha: ${new Date(deliveryDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })} - Ciudad: Tafí Viejo, Tucumán</div>
    </div>

    <div class="section">
      <div style="font-weight: normal; color: #333;">
        Se entrega al señor/a: <strong>${landlord.name}</strong>, la cantidad de pesos: <strong>${n2words(totalAmount, { lang: 'es' })} ($${totalAmount.toLocaleString('es-AR')})</strong>
      </div>
    </div>

    <div class="section">
      <div style="font-weight: normal; color: #333;">
        En concepto de: Pago de alquileres correspondientes a la propiedad ubicada en: <strong>${property.address}</strong>
      </div>
    </div>

    <div class="section">
      <div style="font-weight: normal; color: #333;">
        Forma de entrega: <strong>${deliveryMethod === 'efectivo' ? 'Efectivo' : 'Transferencia Bancaria'}</strong>
      </div>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Período</th>
          <th>N° Recibo</th>
          <th style="text-align: right;">Monto</th>
        </tr>
      </thead>
      <tbody>
        ${payments
          .map(
            (payment) => `
        <tr>
          <td>${new Date(payment.periodMonth + '-01').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</td>
          <td>${payment.receiptNumber}</td>
          <td style="text-align: right;">$ ${payment.amount.toLocaleString()}</td>
        </tr>
        `
          )
          .join('')}
      </tbody>
    </table>

    <div class="total">
      TOTAL ENTREGADO: $ ${totalAmount.toLocaleString()}
    </div>

    <div class="signature">
      <div class="signature-line">
        ${landlord.name}
      </div>
      <div style="font-size: 10px; margin-top: 5px;">Firma del Propietario</div>
    </div>

    <div class="footer">
      <p>Comprobante generado el ${new Date().toLocaleString('es-ES')}</p>
    </div>
  </div>

    <div class="actions">
    <button class="btn btn-print" onclick="downloadPDF()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      Descargar PDF
    </button>
    <button class="btn btn-download" onclick="downloadImage()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      Descargar Imagen
    </button>
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
  <script>
    const paymentIds = ${JSON.stringify(payments.map((p) => p.id))};

    function downloadPDF() {
      fetch('/api/payments/delivery-receipt/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIds })
      })
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'comprobante-entrega.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      });
    }

    async function downloadImage() {
      const actions = document.querySelector('.actions');
      actions.style.display = 'none';
      
      const receipt = document.querySelector('.receipt');
      const canvas = await html2canvas(receipt, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true
      });
      
      actions.style.display = 'flex';
      
      const link = document.createElement('a');
      link.download = 'comprobante-entrega.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  </script>
</body>
</html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error al generar comprobante:', error);
    return NextResponse.json(
      { error: 'Error al generar el comprobante' },
      { status: 500 }
    );
  }
}
