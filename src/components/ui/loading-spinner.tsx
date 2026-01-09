export function LoadingSpinner({ message = "Cargando..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <img 
        src="/favicon-32x32.png" 
        alt="Loading" 
        className="w-12 h-12 animate-spin mb-4"
      />
      <p className="text-gray-600">{message}</p>
    </div>
  );
}
