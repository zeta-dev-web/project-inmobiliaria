import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import n2words from 'n2words';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === 'ADMIN';

    const payment = await prisma.payment.findUnique({
      where: { id },
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
            pricePeriods: {
              orderBy: {
                startMonth: 'asc',
              },
            },
          },
        },
        signedBy: true,
        items: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Pago no encontrado' },
        { status: 404 }
      );
    }

    const paymentDate = new Date(payment.paymentDate);
    const paymentMonth = paymentDate.getMonth();
    const paymentYear = paymentDate.getFullYear();
    const startDate = new Date(payment.rental.startDate);
    const endDate = new Date(payment.rental.endDate);

    const warnings: { contractExpiring?: string; priceUpdate?: string } = {};

    const monthsUntilEnd =
      (endDate.getFullYear() - paymentYear) * 12 +
      (endDate.getMonth() - paymentMonth);

    if (monthsUntilEnd >= 0 && monthsUntilEnd <= 2) {
      const day = endDate.getUTCDate();
      const month = endDate.getUTCMonth();
      const year = endDate.getUTCFullYear();
      const localDate = new Date(year, month, day);
      warnings.contractExpiring = `El contrato vence el ${localDate.toLocaleDateString('es-AR')}`;
    }

    const monthsSinceStart =
      (paymentYear - startDate.getFullYear()) * 12 +
      (paymentMonth - startDate.getMonth());
    const currentContractMonth = monthsSinceStart + 1;

    const nextPeriodWithoutPrice = payment.rental.pricePeriods.find(
      (p) =>
        p.price === null &&
        p.startMonth > currentContractMonth &&
        p.startMonth <= currentContractMonth + 2
    );

    if (nextPeriodWithoutPrice) {
      const updateDate = new Date(startDate);
      updateDate.setMonth(
        startDate.getMonth() + nextPeriodWithoutPrice.startMonth - 1
      );
      const monthName = updateDate.toLocaleDateString('es-ES', {
        month: 'long',
        year: 'numeric',
      });
      warnings.priceUpdate = `Actualización de precio en ${monthName}`;
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Recibo de Alquiler</title>
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
      padding: 15px 20px;
      box-sizing: border-box;
      position: relative;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #600096;
      padding-bottom: 10px;
      margin-bottom: 15px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #600096;
    }
    .receipt-number {
      text-align: right;
      font-size: 11px;
      color: #666;
    }
    .title {
      text-align: center;
      font-size: 18px;
      font-weight: bold;
      color: #600096;
      margin-bottom: 15px;
    }
    .section {
      margin-bottom: 25px;
      font-size: 14px;
      margin-top: 0;
    }
    .section-title {
      font-weight: normal;
      color: #333;
      margin-bottom: 5px;
    }
    .info-row {
      display: flex;
      margin-bottom: 4px;
    }
    .label {
      font-weight: bold;
      min-width: 120px;
    }
    .table {
      width: 50%;
      border-collapse: collapse;
      margin: 10px 0;
      font-size: 11px;
    }
    .table th {
      background-color: #600096;
      color: white;
      padding: 6px;
      text-align: left;
    }
    .table td {
      border: 1px solid #ddd;
      padding: 6px;
    }
    .total {
      text-align: right;
      font-size: 14px;
      font-weight: bold;
      margin-top: 10px;
      color: #600096;
    }
    .signature {
      margin-top: 20px;
      text-align: center;
    }
    .signature-line {
      border-top: 1px solid #000;
      width: 200px;
      margin: 0 auto;
      padding-top: 5px;
      font-size: 10px;
    }
    .footer {
      margin-top: 15px;
      text-align: center;
      font-size: 9px;
      color: #666;
    }
    .qr-section {
      position: absolute;
      right: 20px;
      bottom: 80px;
      text-align: center;
    }
    .qr-section img {
      width: 120px;
      height: 120px;
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
    .btn-whatsapp {
      background-color: #25D366;
      color: white;
    }
    .btn-whatsapp:hover {
      background-color: #20BA5A;
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
      .qr-section { display: block !important; }
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
      <div class="receipt-number">
        <div>Monteagudo 563, Local 2</div>
        <div>Tafí Viejo, Tucumán, Argentina</div>
      </div>
    </div>

    <div class="title">RECIBO DE ALQUILER</div>
    <div style="text-align: center; font-size: 12px; color: #666; margin-top: -10px; margin-bottom: 15px;">N° ${payment.receiptNumber}</div>

    <div class="section" style="text-align: right;">
      <div>Fecha: ${new Date(payment.paymentDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })} - Ciudad: Tafí Viejo, Tucumán</div>
    </div>

    <div class="section">
      <div class="section-title">Recibí de${payment.rental.tenants && payment.rental.tenants.length > 1 ? ' los señores' : 'l señor/a'}: ${payment.rental.tenants && payment.rental.tenants.length > 0 ? payment.rental.tenants.map(t => t.client.name).join(', ') : '-'}.<br/>La cantidad de pesos: <strong>${n2words(payment.amount, { lang: 'es' })} ($${payment.amount.toLocaleString('es-AR')})</strong></div>
    </div>

    <div class="section">
      <div class="section-title">En concepto de: Pago del alquiler correspondiente al mes de <strong>${new Date(payment.periodMonth + '-01').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</strong>, por ${payment.rental.property.propertyUse === 'VIVIENDA' ? 'vivienda' : payment.rental.property.propertyUse === 'LOCAL_COMERCIAL' ? 'local comercial' : 'inmueble'} ubicada en: ${payment.rental.property.address}</div>
    </div>

    <div style="display: flex; gap: 20px; align-items: flex-start;">
      <div style="width: 50%;">
        <table class="table" style="width: 100%; margin-top: 0;">
          <thead>
            <tr>
              <th>Concepto</th>
              <th style="text-align: right; width: 100px;">Monto</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Alquiler</td>
              <td style="text-align: right;">$ ${(() => {
                const baseAmount =
                  payment.amount -
                  payment.items.reduce((sum, item) => sum + item.amount, 0);
                return baseAmount.toLocaleString();
              })()}</td>
            </tr>
            ${payment.items
              .map(
                (item) => `
            <tr>
              <td>${item.description}</td>
              <td style="text-align: right;">$ ${item.amount.toLocaleString()}</td>
            </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
        
        <div class="total" style="text-align: left;">
          TOTAL RECIBIDO: $ ${payment.amount.toLocaleString()}
        </div>
        
        <div style="margin-top: 15px; padding: 10px; background-color: #f3f4f6; border-radius: 5px; font-size: 12px;">
          <div style="font-weight: bold; margin-bottom: 5px; color: #600096;">Entrega al Propietario:</div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span>Alquiler del mes:</span>
            <span>$ ${(() => {
              const baseAmount = payment.amount - payment.items.reduce((sum, item) => sum + item.amount, 0);
              return baseAmount.toLocaleString();
            })()}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span>Administración (${payment.rental.administrationType === 'PERCENTAGE' ? payment.rental.administrationAmount + '%' : '$' + payment.rental.administrationAmount.toLocaleString()}):</span>
            <span>- $ ${(() => {
              const baseAmount = payment.amount - payment.items.reduce((sum, item) => sum + item.amount, 0);
              const adminAmount = payment.rental.administrationType === 'PERCENTAGE' 
                ? (baseAmount * payment.rental.administrationAmount) / 100
                : payment.rental.administrationAmount;
              return adminAmount.toLocaleString();
            })()}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding-top: 5px; border-top: 1px solid #d1d5db; font-weight: bold;">
            <span>A entregar:</span>
            <span style="color: #600096;">$ ${(() => {
              const baseAmount = payment.amount - payment.items.reduce((sum, item) => sum + item.amount, 0);
              const adminAmount = payment.rental.administrationType === 'PERCENTAGE' 
                ? (baseAmount * payment.rental.administrationAmount) / 100
                : payment.rental.administrationAmount;
              return (baseAmount - adminAmount).toLocaleString();
            })()}</span>
          </div>
        </div>
        
        <div style="text-align: left; font-size: 12px; margin-top: 10px; color: #666;">
          A cuenta y orden de: ${payment.rental.landlord.name}
        </div>
      </div>

      <div style="width: 50%;">
        ${
          payment.notes
            ? `
        <div style="margin-bottom: 10px; font-size: 14px;">
          <div class="section-title">OBSERVACIONES: ${payment.notes}</div>
        </div>
        `
            : ''
        }
        
        ${
          warnings.contractExpiring || warnings.priceUpdate
            ? `
        <div style="margin-bottom: 10px; font-size: 14px;">
          <span style="font-weight: bold; color: #d97706;">NOTIFICACIONES: </span><span style="color: #d97706;">${[warnings.contractExpiring, warnings.priceUpdate].filter(Boolean).join(', ')}</span>
        </div>
        `
            : ''
        }
      </div>
    </div>

    <div class="signature">
      <div class="signature-line">
        ${payment.signedBy.name}
      </div>
      <div style="font-size: 10px; margin-top: 5px;">Firma Autorizada</div>
    </div>


    <div class="footer">
      <p>Nº de Transacción: ${payment.transactionHash}</p>
      <p>Recibo generado el ${new Date().toLocaleString('es-ES')}</p>
    </div>

    <div class="qr-section">
      <p style="font-size: 12px; font-weight: bold; color: #600096; margin-bottom: 10px;">Validar Recibo</p>
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`${process.env.NEXT_PUBLIC_BASE_URL}/validate?hash=${payment.transactionHash}`)}" alt="QR Validación" />
      <p style="font-size: 10px; color: #666; margin-top: 5px;">Escanea para verificar autenticidad</p>
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
    ${
      isAdmin
        ? `
    <button class="btn btn-whatsapp" onclick="sendWhatsApp()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
      WhatsApp
    </button>
    `
        : ''
    }
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
  <script>
    function downloadPDF() {
      const paymentId = window.location.pathname.split('/')[3];
      window.location.href = '/api/payments/' + paymentId + '/pdf';
    }

    ${
      isAdmin
        ? `
    function sendWhatsApp() {
      const phone = '${payment.rental.tenants && payment.rental.tenants.length > 0 ? payment.rental.tenants[0].client.phone.replace(/\D/g, '') : ''}';
      const formattedPhone = phone.startsWith('54') ? phone : '54' + phone;
      const receiptUrl = window.location.href;
      const message = 'Hola, adjunto el recibo de pago de alquiler. Puede descargarlo desde: ' + receiptUrl;
      window.open('https://wa.me/' + formattedPhone + '?text=' + encodeURIComponent(message), '_blank');
    }
    `
        : ''
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
      link.download = 'recibo-${payment.receiptNumber.replace(/\//g, '-')}.png';
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
    console.error('Error al generar recibo:', error);
    return NextResponse.json(
      { error: 'Error al generar el recibo' },
      { status: 500 }
    );
  }
}
