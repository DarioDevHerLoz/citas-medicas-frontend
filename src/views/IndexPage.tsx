import React, { useState, useMemo } from "react";
import FullCalendar, { EventInput, DateSelectArg, EventApi } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

// NOTE: This is a single-file dashboard example (React + TS + Tailwind).
// Install: npm i @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction

type Role = "administrador" | "medico" | "paciente";

type User = {
  id: string;
  nombre: string;
  apellidoP: string;
  apellidoM?: string;
  role: Role;
  email: string;
};

type Cita = {
  id: string;
  title: string;
  start: string; // ISO
  end?: string; // ISO
  pacienteId: string;
  medicoId: string;
  estado: "programada" | "completada" | "cancelada";
  notes?: string;
};

export default function IndexPage() {
  // mock users
  const [users] = useState<User[]>([
    { id: "u1", nombre: "Ana", apellidoP: "Lopez", role: "medico", email: "ana@clinica.com" },
    { id: "u2", nombre: "Luis", apellidoP: "Martinez", role: "paciente", email: "luis@mail.com" },
    { id: "u3", nombre: "Sofia", apellidoP: "Perez", role: "administrador", email: "sofia@clinica.com" },
  ]);

  // mock citas
  const [citas, setCitas] = useState<Cita[]>([
    {
      id: "c1",
      title: "Consulta - Luis",
      start: new Date().toISOString().slice(0, 19),
      end: undefined,
      pacienteId: "u2",
      medicoId: "u1",
      estado: "programada",
    },
  ]);

  const [selectedRoleFilter, setSelectedRoleFilter] = useState<Role | "">("");
  const [selectedMedico, setSelectedMedico] = useState<string>("");
  const [query, setQuery] = useState("");

  // modal state for CRUD
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingCita, setEditingCita] = useState<Cita | null>(null);

  // compute events for FullCalendar
  const events: EventInput[] = useMemo(() => {
    return citas.map((c) => ({
      id: c.id,
      title: c.title,
      start: c.start,
      end: c.end,
      extendedProps: { ...c },
    }));
  }, [citas]);

  // helpers
  function openNewCitaModal(selectInfo?: DateSelectArg) {
    const start = selectInfo ? selectInfo.startStr : new Date().toISOString();
    setEditingCita({
      id: `c${Date.now()}`,
      title: "",
      start,
      pacienteId: "",
      medicoId: "",
      estado: "programada",
    });
    setModalOpen(true);
  }

  function openEditModal(event: EventApi) {
    const ext = event.extendedProps as any;
    setEditingCita({
      id: event.id,
      title: event.title || "",
      start: event.startStr,
      end: event.endStr || undefined,
      pacienteId: ext.pacienteId,
      medicoId: ext.medicoId,
      estado: ext.estado,
      notes: ext.notes,
    });
    setModalOpen(true);
  }

  function saveCita(cita: Cita) {
    setCitas((prev) => {
      const exists = prev.find((p) => p.id === cita.id);
      if (exists) {
        return prev.map((p) => (p.id === cita.id ? cita : p));
      }
      return [...prev, cita];
    });
    setModalOpen(false);
    setEditingCita(null);
  }

  function deleteCita(id: string) {
    setCitas((prev) => prev.filter((p) => p.id !== id));
    setModalOpen(false);
    setEditingCita(null);
  }

  // filtered lists
  const medicos = users.filter((u) => u.role === "medico");
  const pacientes = users.filter((u) => u.role === "paciente");

  const filteredCitas = citas.filter((c) => {
    if (selectedMedico && c.medicoId !== selectedMedico) return false;
    if (query && !c.title.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden md:block">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-blue-700">ClinicaCare</h2>
          <p className="text-sm text-gray-500 mt-1">Panel de administración</p>
        </div>

        <nav className="p-4 space-y-2">
          <a className="block px-3 py-2 rounded hover:bg-gray-50" href="#">Dashboard</a>
          <a className="block px-3 py-2 rounded hover:bg-gray-50" href="#">Citas</a>
          <a className="block px-3 py-2 rounded hover:bg-gray-50" href="#">Pacientes</a>
          <a className="block px-3 py-2 rounded hover:bg-gray-50" href="#">Médicos</a>
          <a className="block px-3 py-2 rounded hover:bg-gray-50" href="#">Reportes</a>
        </nav>

        <div className="p-4 mt-auto text-sm text-gray-500">
          <p>Usuario: <strong>Sofia</strong></p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Citas</h1>
            <p className="text-sm text-gray-600">Agenda y administración de citas médicas</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              placeholder="Buscar cita..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="px-3 py-2 border rounded-lg outline-none"
            />

            <select
              value={selectedMedico}
              onChange={(e) => setSelectedMedico(e.target.value)}
              className="px-3 py-2 border rounded-lg outline-none"
            >
              <option value="">Todos los médicos</option>
              {medicos.map((m) => (
                <option key={m.id} value={m.id}>{`${m.nombre} ${m.apellidoP}`}</option>
              ))}
            </select>

            <button
              onClick={() => openNewCitaModal()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              + Nueva cita
            </button>
          </div>
        </header>

        {/* Stats + Calendar layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-sm text-gray-500">Citas hoy</h3>
              <p className="text-2xl font-bold">{citas.length}</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-sm text-gray-500">Próximas</h3>
              <ul className="mt-2 space-y-2 max-h-64 overflow-auto">
                {filteredCitas.map((c) => (
                  <li key={c.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{c.title}</p>
                      <p className="text-xs text-gray-500">{new Date(c.start).toLocaleString()}</p>
                    </div>
                    <div className="text-sm text-gray-400">{c.estado}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-sm text-gray-500">Exportar</h3>
              <div className="mt-3 flex gap-2">
                <button className="px-3 py-2 border rounded">PDF</button>
                <button className="px-3 py-2 border rounded">CSV</button>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow-sm">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
              selectable
              select={(info) => openNewCitaModal(info)}
              events={events}
              eventClick={(arg) => openEditModal(arg.event)}
              height={650}
            />
          </div>
        </div>

        {/* Modal for create/edit */}
        {isModalOpen && editingCita && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-lg rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">{editingCita?.title ? 'Editar Cita' : 'Nueva Cita'}</h2>

              <div className="grid grid-cols-1 gap-3">
                <label className="text-sm">Título</label>
                <input
                  value={editingCita.title}
                  onChange={(e) => setEditingCita({ ...editingCita, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />

                <label className="text-sm">Médico</label>
                <select
                  value={editingCita.medicoId}
                  onChange={(e) => setEditingCita({ ...editingCita, medicoId: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Seleccione médico</option>
                  {medicos.map((m) => (
                    <option key={m.id} value={m.id}>{`${m.nombre} ${m.apellidoP}`}</option>
                  ))}
                </select>

                <label className="text-sm">Paciente</label>
                <select
                  value={editingCita.pacienteId}
                  onChange={(e) => setEditingCita({ ...editingCita, pacienteId: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Seleccione paciente</option>
                  {pacientes.map((p) => (
                    <option key={p.id} value={p.id}>{`${p.nombre} ${p.apellidoP}`}</option>
                  ))}
                </select>

                <label className="text-sm">Fecha y hora de inicio</label>
                <input
                  type="datetime-local"
                  value={editingCita.start?.slice(0, 16) || ''}
                  onChange={(e) => setEditingCita({ ...editingCita, start: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />

                <label className="text-sm">Estado</label>
                <select
                  value={editingCita.estado}
                  onChange={(e) => setEditingCita({ ...editingCita, estado: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="programada">Programada</option>
                  <option value="completada">Completada</option>
                  <option value="cancelada">Cancelada</option>
                </select>

                <label className="text-sm">Notas</label>
                <textarea
                  value={editingCita.notes || ''}
                  onChange={(e) => setEditingCita({ ...editingCita, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded h-24"
                />

                <div className="flex justify-end gap-2 mt-4">
                  {editingCita.id && (
                    <button onClick={() => deleteCita(editingCita.id)} className="px-4 py-2 rounded border text-red-600">Eliminar</button>
                  )}
                  <button onClick={() => { setModalOpen(false); setEditingCita(null); }} className="px-4 py-2 rounded border">Cancelar</button>
                  <button onClick={() => saveCita(editingCita)} className="px-4 py-2 rounded bg-blue-600 text-white">Guardar</button>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
