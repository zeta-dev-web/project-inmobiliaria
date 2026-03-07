export default function RentCalculatorPage() {
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">Calculadora de Alquileres</h1>
      <iframe 
        src="https://arquiler.com/" 
        className="w-full h-[calc(100vh-200px)] border-0 rounded-lg shadow-lg"
        title="Calculadora de Alquileres"
      />
    </div>
  );
}
