import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

interface Cita {
  id: number;
  fecha: string;
  hora: string;
  medico: string;
  estado: "pendiente" | "completada";
}

export default function PacienteDashboard() {
  const [citas, setCitas] = useState<Cita[]>([
    {
      id: 1,
      fecha: "2025-11-30",
      hora: "10:00",
      medico: "Dr. Pérez",
      estado: "pendiente",
    },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [newFecha, setNewFecha] = useState("");
  const [newHora, setNewHora] = useState("");

  // 🔒 BLOQUEAR SCROLL CUANDO EL MODAL ESTÁ ABIERTO
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  // Convertir a eventos de FullCalendar
  const eventos = citas.map((cita) => ({
    id: cita.id.toString(),
    title: `${cita.medico} (${cita.hora})`,
    date: cita.fecha,
    backgroundColor: cita.estado === "completada" ? "#22c55e" : "#3b82f6",
    borderColor: cita.estado === "completada" ? "#16a34a" : "#1d4ed8",
  }));

  const generarPDF = () => {
    const pdf = new jsPDF();
    pdf.text("Mis Citas Médicas", 10, 10);

    citas.forEach((cita, index) => {
      pdf.text(
        `${index + 1}. Fecha: ${cita.fecha} - Hora: ${cita.hora} - Médico: ${
          cita.medico
        } - Estado: ${cita.estado}`,
        10,
        20 + index * 10
      );
    });

    pdf.save("mis_citas.pdf");
  };

  const agendarCita = () => {
    const nueva = {
      id: citas.length + 1,
      fecha: newFecha,
      hora: newHora,
      medico: "Dr. Asignado",
      estado: "pendiente",
    };
    setCitas([...citas, nueva]);
    setIsOpen(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Mis Citas</h1>

      {/* Botones */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Agendar Cita
        </button>

        <button
          onClick={generarPDF}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Exportar PDF
        </button>
      </div>

      {/* Calendario */}
      <div className="bg-white shadow p-4 rounded">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          height="700px"
          events={eventos}
        />
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white p-6 rounded shadow-lg w-96 z-[10000]">
            <h2 className="text-xl font-bold mb-4">Agendar Nueva Cita</h2>

            <input
              type="date"
              className="border p-2 w-full mb-3"
              onChange={(e) => setNewFecha(e.target.value)}
            />

            <input
              type="time"
              className="border p-2 w-full mb-3"
              onChange={(e) => setNewHora(e.target.value)}
            />

            <button
              onClick={agendarCita}
              className="bg-green-600 text-white w-full py-2 rounded"
            >
              Guardar
            </button>

            <button
              onClick={() => setIsOpen(false)}
              className="mt-2 w-full py-2 rounded border"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
