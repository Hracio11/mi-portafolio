export default function AdminDashboard() {
  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">Panel de Control (CMS)</h1>
      <p className="text-gray-600">Desde aquí gestionarás tus proyectos.</p>
      
      <button className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
        + Agregar Nuevo Proyecto
      </button>
    </div>
  );
}