import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const res = await fetch("http://localhost:5005/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Error al iniciar sesión");
        return;
      }

      // Guardar token
      localStorage.setItem("token", data.token);

      // Decodificar payload del JWT
      const payloadBase64 = data.token.split(".")[1];
      const payload = JSON.parse(atob(payloadBase64));

      const rol = payload.rol;

      // Redirección según rol
      if (rol === "admin") navigate("/admin/dashboard");
      else if (rol === "paciente") navigate("/paciente");
      else if (rol === "medico") navigate("/medico");
      else navigate("/");

    } catch (error) {
      console.error(error);
      setErrorMsg("Error de conexión con el servidor");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">
          Iniciar Sesión
        </h1>

        {errorMsg && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-3">
            {errorMsg}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="correo@correo.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-all"
          >
            Entrar
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          ¿No tienes cuenta?{" "}
          <a className="text-blue-600 font-semibold hover:underline" href="/register">
            Regístrate aquí
          </a>
        </p>
      </div>
    </div>
  );
}
