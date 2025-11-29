import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

interface Cita {
  id: number;
  title: string;
  date: string;
  estado: "pendiente" | "completada";
}

export default function MedicoDashboard() {
  const [citas, setCitas] = useState<Cita[]>([
    { id: 1, title: "Paciente Juan", date: "2025-11-30", estado: "pendiente" },
    { id: 2, title: "Paciente María", date: "2025-12-02", estado: "completada" },
  ]);

  const [selected, setSelected] = useState<Cita | null>(null);

  // bloquear scroll cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = selected ? "hidden" : "auto";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "auto";
    };
  }, [selected]);

  const marcar = (estado: "pendiente" | "completada") => {
    if (!selected) return;
    setCitas((prev) => prev.map((c) => (c.id === selected.id ? { ...c, estado } : c)));
    setSelected(null);
  };

  // pasar citas a eventos con color por estado
  const eventos = citas.map((c) => ({
    id: c.id.toString(),
    title: c.title,
    date: c.date,
    backgroundColor: c.estado === "completada" ? "#16a34a" : "#2563eb", // verde / azul
    borderColor: c.estado === "completada" ? "#15803d" : "#1e40af",
    textColor: "#ffffff",
  }));

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Citas del Médico</h1>

      <div className="bg-white rounded-lg shadow-md p-4">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={eventos}
          eventClick={(info) => {
            // evita comportamientos por defecto del calendario
            info.jsEvent.preventDefault();
            // buscar cita por id (FullCalendar devuelve string)
            const id = Number(info.event.id);
            const cita = citas.find((c) => c.id === id) || null;
            setSelected(cita);
          }}
          height="650px"
          // estilos para mejorar la apariencia
          dayMaxEventRows={4}
        />
      </div>

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          aria-modal="true"
          role="dialog"
        >
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setSelected(null)}
          />

          {/* card */}
          <div
            className="relative bg-white w-full max-w-md mx-4 rounded-2xl shadow-2xl p-6 z-[10000] transform transition-all duration-200 ease-out
                       animate-[fadeIn_200ms_ease] motion-reduce:animate-none"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "scaleIn .18s ease-out" }}
          >
            <header className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{selected.title}</h2>
                <p className="text-sm text-gray-500 mt-1">{selected.date}</p>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 rounded p-1"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </header>

            <section className="mt-4">
              <p className="text-sm text-gray-600">
                Estado actual:{" "}
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    selected.estado === "completada" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {selected.estado}
                </span>
              </p>

              {/* acciones */}
              <div className="mt-6 grid grid-cols-1 gap-3">
                <button
                  onClick={() => marcar("completada")}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 hover:bg-green-700 text-white py-2 px-3 transition"
                >
                  Marcar como completada
                </button>

                <button
                  onClick={() => marcar("pendiente")}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-3 transition"
                >
                  Marcar como pendiente
                </button>

                <button
                  onClick={() => setSelected(null)}
                  className="w-full rounded-lg border border-gray-200 text-gray-700 py-2 px-3"
                >
                  Cerrar
                </button>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* animación CSS mínima (inlined para compatibilidad) */}
      <style>{`
        @keyframes scaleIn {
          0% { opacity: 0; transform: translateY(6px) scale(.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
