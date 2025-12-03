import React, { useEffect, useState } from "react";
import ApexChart from "react-apexcharts";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5005";

function getToken() {
  return localStorage.getItem("token");
}

export default function ReportesPage() {
  const [stats, setStats] = useState<any>(null);
  const [meses, setMeses] = useState<number[]>([]);
  const [porMedico, setPorMedico] = useState<any[]>([]);
  const [estado, setEstado] = useState<any>(null);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    const token = getToken();
    const headers = { Authorization: `Bearer ${token}` };

    const [r1, r2, r3, r4] = await Promise.all([
      fetch(`${API_URL}/api/reportes/estadisticas`, { headers }),
      fetch(`${API_URL}/api/reportes/citas-mes`, { headers }),
      fetch(`${API_URL}/api/reportes/citas-medico`, { headers }),
      fetch(`${API_URL}/api/reportes/estado`, { headers }),
    ]);

    setStats(await r1.json());
    setMeses(await r2.json());
    setPorMedico(await r3.json());
    setEstado(await r4.json());
  }

  if (!stats || !estado) return <p>Cargando reportes...</p>;

  return (
    <div className="space-y-6">

      {/* TARJETAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card titulo="Total citas" valor={stats.totalCitas} />
        <Card titulo="Completadas" valor={stats.completadas} />
        <Card titulo="Pendientes" valor={stats.pendientes} />
        <Card titulo="Canceladas" valor={stats.canceladas} />
      </div>

      {/* Citas por mes */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold text-gray-700 mb-3">Citas por mes</h2>
        <ApexChart
          type="bar"
          height={320}
          series={[{ name: "Citas", data: meses }]}
          options={{
            chart: { toolbar: { show: false } },
            colors: ["#2563eb"],
            xaxis: {
              categories: [
                "Ene","Feb","Mar","Abr","May","Jun",
                "Jul","Ago","Sep","Oct","Nov","Dic"
              ],
            },
          }}
        />
      </div>

      {/* Citas por médico */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold text-gray-700 mb-3">Citas por médico</h2>

        <ApexChart
          type="bar"
          height={320}
          series={[{
            name: "Citas",
            data: porMedico.map(m => m.cantidad)
          }]}
          options={{
            chart: { toolbar: { show: false } },
            plotOptions: { bar: { horizontal: true } },
            colors: ["#1d4ed8"],
            xaxis: { categories: porMedico.map(m => m.medico) },
          }}
        />
      </div>

      {/* Estados de citas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold text-gray-700 mb-3">Estados de citas</h2>

        <ApexChart
          type="donut"
          height={320}
          series={[
            estado.pendientes,
            estado.completadas,
            estado.canceladas,
          ]}
          options={{
            labels: ["Pendientes", "Completadas", "Canceladas"],
            colors: ["#3b82f6", "#22c55e", "#ef4444"],
            legend: { position: "bottom" },
          }}
        />
      </div>
    </div>
  );
}

function Card({ titulo, valor }: any) {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <p className="text-sm text-gray-500">{titulo}</p>
      <p className="text-3xl font-bold text-blue-700">{valor}</p>
    </div>
  );
}
