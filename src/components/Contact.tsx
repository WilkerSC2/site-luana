import React, { useState } from 'react';
import emailjs from 'emailjs-com';
import { MapPin, Phone, Mail, Send, CheckCircle } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<'success' | 'error' | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 2) {
        newValue = digits;
      } else if (digits.length <= 7) {
        newValue = `(${digits.slice(0,2)}) ${digits.slice(2)}`;
      } else if (digits.length <= 11) {
        newValue = `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7,11)}`;
      } else {
        newValue = `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7,11)}`;
      }
    }
    setFormData({
      ...formData,
      [name]: newValue
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const honeypot = (document.querySelector('input[name="company"]') as HTMLInputElement)?.value;
    if (honeypot) {
      setError('Envio bloqueado por segurança.');
      return;
    }
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Preencha todos os campos obrigatórios corretamente.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('E-mail inválido.');
      return;
    }

  const serviceID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const userID = import.meta.env.VITE_EMAILJS_USER_ID;

    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      phone: formData.phone,
      service: formData.service,
      message: formData.message,
      to_email: 'lequeluana@gmail.com',
    };

  const confirmTemplateID = 'template_8nsdqur';
    const confirmParams = {
      to_name: formData.name,
      to_email: formData.email,
    };

    emailjs.send(serviceID, templateID, templateParams, userID)
      .then(() => {

        emailjs.send(serviceID, confirmTemplateID, confirmParams, userID)
          .then(() => {
            setShowModal('success');
            setFormData({ name: '', email: '', phone: '', service: '', message: '' });
          })
          .catch(() => {
            setShowModal('success');
            setFormData({ name: '', email: '', phone: '', service: '', message: '' });
          });
      })
      .catch(() => {
        setError('Ocorreu um erro ao enviar. Tente novamente mais tarde.');
        setShowModal('error');
      });
  };

  const contactInfo = [
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Localização',
      content: 'São Paulo, SP - Brasil'
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Telefone',
      content: (
        <>
          +55 (11) 96169-8314<br />
          <a
            href="https://wa.me/5511961698314"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 underline"
          >
            WhatsApp disponível
          </a>
        </>
      )
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email',
      content: (
        <>
          <a
            href="mailto:lequeluana@gmail.com"
            className="text-purple-600 underline"
          >
            lequeluana@gmail.com
          </a>
          <br />
          Resposta em até 24h
        </>
      )
    }
  ];

  return (
  <section id="contact" className="py-20 bg-white dark:bg-[#140F1E] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-light text-gray-900 dark:text-white mb-6 font-playfair">
            Contato
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Pronto para criar algo incrível juntos? Entre em contato para conversarmos sobre seu projeto
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          <div>
            <h3 className="text-2xl font-light text-gray-900 dark:text-white mb-8">
              Vamos conversar
            </h3>
            <div className="space-y-8">
              {contactInfo.map((info, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md">
                  <div className="text-purple-600 dark:text-purple-400 mt-1">
                    {info.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{info.title}</h4>
                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{info.content}</p>
                  </div>
                </div>
              ))}
            </div>

            
            {showModal === 'success' && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-8 text-center max-w-sm mx-auto">
                  <CheckCircle className="w-10 h-10 mx-auto text-green-600 mb-4" />
                  <h4 className="text-xl font-semibold mb-2 text-green-700 dark:text-green-400">Mensagem enviada com sucesso!</h4>
                  <p className="text-gray-700 dark:text-gray-300 mb-6">Entraremos em contato em breve.</p>
                  <button
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition"
                    onClick={() => { setShowModal(null); }}
                  >Fechar</button>
                </div>
              </div>
            )}
            {showModal === 'error' && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-8 text-center max-w-sm mx-auto">
                  <h4 className="text-xl font-semibold mb-2 text-red-700 dark:text-red-400">Erro ao enviar mensagem</h4>
                  <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
                  <button
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition"
                    onClick={() => setShowModal(null)}
                  >Tentar novamente</button>
                </div>
              </div>
            )}
          </div>

          
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Digite seu nome completo"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(11) 9999-9999"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                />
              </div>

              <div>
                <label htmlFor="service" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Serviço de Interesse
                </label>
                <select
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                >
                  <option value="">Selecione um serviço</option>
                  <option value="Retratos Profissionais">Retratos Profissionais</option>
                  <option value="Casamentos">Casamentos</option>
                  <option value="Eventos Familiares">Eventos Familiares</option>
                  <option value="Corporativo">Corporativo</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mensagem *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Conte-me mais sobre seu projeto, datas, localização e suas expectativas..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-vertical bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-purple-500 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center space-x-2 shadow-xl hover:shadow-2xl hover:shadow-purple-500/25"
              >
                <Send className="w-5 h-5" />
                <span>Enviar Mensagem</span>
              </button>
              <input type="text" name="company" style={{display: 'none'}} autoComplete="off" tabIndex={-1} />
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;