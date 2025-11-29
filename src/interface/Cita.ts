export interface Cita {
  id: string;
  medicoId: string;
  pacienteId: string;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  motivo: string;
  estado: 'Pendiente' | 'Confirmada' | 'Cancelada';
}
