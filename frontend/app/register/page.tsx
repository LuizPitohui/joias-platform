"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/services/api";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validatePassword = (pass: string) => {
    // Regex: 8 chars, maiuscula, minuscula, numero, especial
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(pass);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (!validatePassword(formData.password)) {
      setError("Senha fraca. Use: min 8 chars, maiúscula, minúscula, número e símbolo (@$!%*?&).");
      return;
    }

    try {
      await api.post("/register/", {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        username: formData.email, // Django precisa de username
        password: formData.password,
        phone: formData.phone // Envia, mas é opcional
      });
      
      alert("Cadastro realizado com sucesso! Faça login.");
      router.push("/login");
    } catch (err: any) {
      console.error(err);
      setError("Erro ao cadastrar. Verifique se o email já existe.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-serif text-gray-900">Crie sua conta</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou <Link href="/login" className="font-medium text-emerald-600 hover:text-emerald-500">faça login se já tem conta</Link>
          </p>
        </div>
        
        {error && <div className="bg-red-50 text-red-500 p-3 rounded text-sm text-center">{error}</div>}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input name="firstName" type="text" required placeholder="Nome" onChange={handleChange} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm" />
              <input name="lastName" type="text" required placeholder="Sobrenome" onChange={handleChange} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm" />
            </div>
            
            <input name="email" type="email" required placeholder="Email" onChange={handleChange} className="mb-4 appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
            
            <input name="phone" type="tel" placeholder="Telefone (Opcional agora)" onChange={handleChange} className="mb-4 appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
            
            <input name="password" type="password" required placeholder="Senha" onChange={handleChange} className="mb-4 appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
            
            <input name="confirmPassword" type="password" required placeholder="Confirme a Senha" onChange={handleChange} className="mb-4 appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
          </div>

          <div>
            <button type="submit" className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-900 hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
              Cadastrar
            </button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Ou entre com</span></div>
          </div>

          <button type="button" onClick={() => alert("Google Login requer configuração no Cloud Console. Funcionalidade pronta para integrar.")} className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
            <img className="h-5 w-5 mr-2" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="" />
            Google
          </button>
        </form>
      </div>
    </div>
  );
}