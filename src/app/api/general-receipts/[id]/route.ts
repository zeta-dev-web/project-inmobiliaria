import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import n2words from 'n2words';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const receipt = await prisma.generalReceipt.findUnique({
      where: { id },
      include: {
        signedBy: { select: { name: true, signatureUrl: true } },
      },
    });

    if (!receipt) {
      return NextResponse.json({ message: 'Recibo no encontrado' }, { status: 404 });
    }

    const clients = await prisma.client.findMany({
      where: { id: { in: receipt.clientIds } },
      select: { id: true, name: true },
    });

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Recibo General</title>
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
    }
    .section-title {
      font-weight: normal;
      color: #333;
      margin-bottom: 5px;
    }
    .total {
      text-align: left;
      font-size: 14px;
      font-weight: bold;
      margin-top: 10px;
      color: #600096;
    }
    .signature {
      margin-top: 40px;
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
    @media print {
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

    <div class="title">RECIBO GENERAL</div>
    <div style="text-align: center; font-size: 12px; color: #666; margin-top: -10px; margin-bottom: 15px;">N° ${receipt.receiptNumber}</div>

    <div class="section" style="text-align: right;">
      <div>Fecha: ${new Date(receipt.receiptDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })} - Ciudad: Tafí Viejo, Tucumán</div>
    </div>

    <div class="section">
      <div class="section-title">Recibí de${clients.length > 1 ? ' los señores' : 'l señor/a'}: ${clients.map(c => c.name).join(', ')}.<br/>La cantidad de pesos: <strong>${n2words(receipt.amount, { lang: 'es' })} ($${receipt.amount.toLocaleString('es-AR')})</strong></div>
    </div>

    <div class="section">
      <div class="section-title">En concepto de: ${receipt.reason}</div>
    </div>

    <div class="total">
      TOTAL RECIBIDO: $ ${receipt.amount.toLocaleString('es-AR')}
    </div>

    <div class="signature">
      <div class="signature-line">
        ${receipt.signedBy.name}
      </div>
      <div style="font-size: 10px; margin-top: 5px;">Firma Autorizada</div>
    </div>

    <div class="footer">
      <p>Nº de Transacción: ${receipt.transactionHash}</p>
      <p>Recibo generado el ${new Date().toLocaleString('es-ES')}</p>
    </div>

    <div class="qr-section">
      <p style="font-size: 12px; font-weight: bold; color: #600096; margin-bottom: 10px;">Validar Recibo</p>
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`${process.env.NEXT_PUBLIC_BASE_URL}/validate?hash=${receipt.transactionHash}`)}" alt="QR Validación" />
      <p style="font-size: 10px; color: #666; margin-top: 5px;">Escanea para verificar autenticidad</p>
    </div>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (error) {
    return NextResponse.json({ message: 'Error al generar recibo' }, { status: 500 });
  }
}
