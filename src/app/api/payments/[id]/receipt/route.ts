import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import n2words from 'n2words';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        rental: {
          include: {
            property: true,
            tenant: true,
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
        { error: "Pago no encontrado" },
        { status: 404 }
      );
    }

    // Calcular warnings
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const startDate = new Date(payment.rental.startDate);
    const endDate = new Date(payment.rental.endDate);
    
    const warnings: { contractExpiring?: string; priceUpdate?: string } = {};
    
    const monthsUntilEnd = (endDate.getFullYear() - currentYear) * 12 + (endDate.getMonth() - currentMonth);
    
    if (monthsUntilEnd >= 0 && monthsUntilEnd <= 2) {
      const day = endDate.getUTCDate();
      const month = endDate.getUTCMonth();
      const year = endDate.getUTCFullYear();
      const localDate = new Date(year, month, day);
      warnings.contractExpiring = `El contrato vence el ${localDate.toLocaleDateString('es-AR')}`;
    }
    
    const monthsSinceStart = (currentYear - startDate.getFullYear()) * 12 + (currentMonth - startDate.getMonth());
    const currentContractMonth = monthsSinceStart + 1;
    
    const nextPeriodWithoutPrice = payment.rental.pricePeriods.find(p => 
      p.price === null && 
      p.startMonth > currentContractMonth && 
      p.startMonth <= currentContractMonth + 2
    );
    
    if (nextPeriodWithoutPrice) {
      const updateDate = new Date(startDate);
      updateDate.setMonth(startDate.getMonth() + nextPeriodWithoutPrice.startMonth - 1);
      const monthName = updateDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
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
      height: 24.75cm;
      padding: 15px 20px;
      box-sizing: border-box;
      page-break-after: always;
      border-bottom: 1px dashed #ccc;
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
      <div class="section-title">Recibí del señor/a: ${payment.rental.tenant.name}, la cantidad de pesos: <strong>${n2words(payment.amount, { lang: 'es' })} ($${payment.amount.toLocaleString('es-AR')})</strong></div>
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
                const baseAmount = payment.amount - payment.items.reduce((sum, item) => sum + item.amount, 0);
                return baseAmount.toLocaleString();
              })()}</td>
            </tr>
            ${payment.items.map(item => `
            <tr>
              <td>${item.description}</td>
              <td style="text-align: right;">$ ${item.amount.toLocaleString()}</td>
            </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total" style="text-align: left;">
          TOTAL RECIBIDO: $ ${payment.amount.toLocaleString()}
        </div>
        <div style="text-align: left; font-size: 12px; margin-top: 5px; color: #666;">
          A cuenta y orden de: ${payment.rental.landlord.name}
        </div>
      </div>

      <div style="width: 50%;">
        ${payment.notes ? `
        <div style="margin-bottom: 10px; font-size: 14px;">
          <div class="section-title">OBSERVACIONES: ${payment.notes}</div>
        </div>
        ` : ''}
        
        ${warnings.contractExpiring || warnings.priceUpdate ? `
        <div style="margin-bottom: 10px; font-size: 14px;">
          <span style="font-weight: bold; color: #d97706;">NOTIFICACIONES: </span><span style="color: #d97706;">${[warnings.contractExpiring, warnings.priceUpdate].filter(Boolean).join(', ')}</span>
        </div>
        ` : ''}
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
  </div>

  <script>
    window.onload = function() {
      window.print();
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
    console.error("Error al generar recibo:", error);
    return NextResponse.json(
      { error: "Error al generar el recibo" },
      { status: 500 }
    );
  }
}
