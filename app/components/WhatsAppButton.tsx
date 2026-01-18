'use client';

export function WhatsAppButton() {
  const phoneNumber = '51987654321'; // Reemplazar con tu número de WhatsApp
  const message = encodeURIComponent('Hola, me gustaría contactarte');

  return (
    <a
      href={`https://wa.me/${phoneNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform duration-200 flex items-center gap-2 font-bold z-40"
      title="Contactar por WhatsApp"
    >
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378l-.361.214-3.741-.982.998 3.645-.235.364a9.864 9.864 0 001.516 5.394c3.534 5.155 9.949 7.955 15.833 6.777 1.687-.39 3.286-1.061 4.718-1.996l.323-.194 3.759.992-.989-3.65.231-.364a9.884 9.884 0 00-1.663-5.373c-3.535-5.159-9.949-7.959-15.833-6.778z"/>
      </svg>
      WhatsApp
    </a>
  );
}
