import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  User, Mail, Lock, Camera, Settings, Shield, 
  CreditCard, Monitor, Download, Trash2, LogOut,
  Smartphone, Globe, Bell, CheckCircle, XCircle,
  Key, QrCode, ShieldCheck, Activity, Edit, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { getImageUrl } from '../utils/formatters';
import { ROLE_LABELS } from '../utils/constants';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

// 🔧 MOVER Componente de Confirmação para ANTES do componente principal
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirmar", danger = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{message}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            variant={danger ? "danger" : "primary"} 
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </Card>
    </div>
  );
};

const Profile = () => {
  const { user, updateUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Estados para novas funcionalidades
  const [emailVerification, setEmailVerification] = useState({
    sent: false,
    loading: false
  });
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [twoFA, setTwoFA] = useState({
    enabled: user?.two_factor_enabled || false,
    settingUp: false,
    qrCode: null,
    recoveryCodes: [],
    verificationCode: ''
  });
  const [activities, setActivities] = useState([]);
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    push_notifications: false,
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    theme: 'light'
  });
  const [socialConnections, setSocialConnections] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);

  const { register: registerProfile, handleSubmit: handleSubmitProfile, formState: { errors: errorsProfile }, reset: resetProfile } = useForm({
    defaultValues: {
      username: user?.username,
      email: user?.email
    }
  });

  const { register: registerPassword, handleSubmit: handleSubmitPassword, watch, formState: { errors: errorsPassword }, reset: resetPassword } = useForm();

  const password = watch('newPassword');

  // Tabs config
  const publicTabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'activity', label: 'Atividade', icon: Activity },
  ];

  const privateTabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'security', label: 'Segurança', icon: Lock },
    { id: 'sessions', label: 'Sessões', icon: Monitor },
    { id: 'preferences', label: 'Preferências', icon: Settings },
    { id: 'privacy', label: 'Privacidade', icon: Shield },
    { id: 'billing', label: 'Assinatura', icon: CreditCard },
  ];

  const currentTabs = isEditing ? privateTabs : publicTabs;

  // 🔄 Alternar entre modo visualização e edição
  const handleEditToggle = () => {
    if (isEditing) {
      // Sair do modo edição - resetar alterações
      resetProfile();
      setAvatarFile(null);
      setAvatarPreview(null);
    }
    setIsEditing(!isEditing);
  };

  // Efeitos para carregar dados
  useEffect(() => {
    if (activeTab === 'sessions' && isEditing) {
      fetchSessions();
    }
    if (activeTab === 'preferences' && isEditing) {
      fetchPreferences();
    }
  }, [activeTab, isEditing]);

  // 🔐 Verificação de Email
  const handleSendVerification = async () => {
    try {
      setEmailVerification(prev => ({ ...prev, loading: true }));
      await authService.sendVerificationEmail();
      setEmailVerification({ sent: true, loading: false });
      toast.success('Email de verificação enviado!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao enviar email de verificação');
    }
  };

  // 💻 Gerenciamento de Sessões
  const fetchSessions = async () => {
    try {
      setLoadingSessions(true);
      const response = await authService.getActiveSessions();
      setSessions(response.sessions);
    } catch (error) {
      toast.error('Erro ao carregar sessões');
    } finally {
      setLoadingSessions(false);
    }
  };

  const revokeSession = async (sessionId) => {
    try {
      await authService.revokeSession(sessionId);
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      toast.success('Sessão revogada com sucesso');
    } catch (error) {
      toast.error('Erro ao revogar sessão');
    }
  };

  const revokeAllSessions = async () => {
    try {
      await authService.revokeAllSessions();
      setSessions([]);
      toast.success('Todas as sessões foram revogadas');
    } catch (error) {
      toast.error('Erro ao revogar sessões');
    }
  };

  // 🔒 Autenticação de Dois Fatores (2FA)
  const enable2FA = async () => {
    try {
      setTwoFA(prev => ({ ...prev, settingUp: true }));
      const response = await authService.setup2FA();
      setTwoFA(prev => ({
        ...prev,
        qrCode: response.qr_code,
        recoveryCodes: response.recovery_codes,
        settingUp: false
      }));
      setShow2FAModal(true);
    } catch (error) {
      toast.error('Erro ao configurar 2FA');
      setTwoFA(prev => ({ ...prev, settingUp: false }));
    }
  };

  const confirm2FA = async () => {
    try {
      await authService.confirm2FA({ code: twoFA.verificationCode });
      setTwoFA(prev => ({ ...prev, enabled: true }));
      setShow2FAModal(false);
      toast.success('Autenticação de dois fatores ativada!');
    } catch (error) {
      toast.error('Código inválido');
    }
  };

  const disable2FA = async () => {
    try {
      await authService.disable2FA();
      setTwoFA({ enabled: false, settingUp: false, qrCode: null, recoveryCodes: [] });
      toast.success('Autenticação de dois fatores desativada');
    } catch (error) {
      toast.error('Erro ao desativar 2FA');
    }
  };

  // 📊 Preferências do Usuário
  const fetchPreferences = async () => {
    try {
      const response = await authService.getPreferences();
      setPreferences(response.preferences);
    } catch (error) {
      console.error('Erro ao carregar preferências');
    }
  };

  const updatePreferences = async (newPreferences) => {
    try {
      await authService.updatePreferences(newPreferences);
      setPreferences(newPreferences);
      toast.success('Preferências atualizadas!');
    } catch (error) {
      toast.error('Erro ao atualizar preferências');
    }
  };

  // 📥 Exportação de Dados
  const handleExportData = async () => {
    try {
      setLoading(true);
      const response = await authService.exportUserData();
      
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meus-dados-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Dados exportados com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar dados');
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ Exclusão de Conta
  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'CONFIRMAR') {
      toast.error('Digite "CONFIRMAR" para excluir a conta');
      return;
    }

    try {
      await authService.deleteAccount();
      toast.success('Conta excluída com sucesso');
      logout();
      navigate('/login');
    } catch (error) {
      toast.error('Erro ao excluir conta');
    }
  };

  // 👤 Upload de Avatar com Drag & Drop
  const handleAvatarChange = useCallback((e) => {
    const file = e.target.files?.[0];
    processAvatarFile(file);
  }, []);

  const processAvatarFile = (file) => {
    if (!file) return;

    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Por favor, selecione uma imagem JPEG, PNG, GIF ou WebP');
      return;
    }

    // Validar tamanho do arquivo (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    console.log('✅ Avatar selecionado:', file.name, file.size);
    setAvatarFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    processAvatarFile(file);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  // 📝 Atualização de Perfil
  const handleProfileUpdate = async (data) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('username', data.username);
      formData.append('email', data.email);

      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const response = await authService.updateProfile(formData);
      updateUser(response.user);
      
      // Resetar estados após sucesso
      setAvatarFile(null);
      setAvatarPreview(null);
      
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  // 🔑 Alteração de Senha
  const handlePasswordChange = async (data) => {
    try {
      setLoading(true);
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toast.success('Senha alterada com sucesso!');
      resetPassword();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  // Componente de Visualização Pública do Perfil
  const PublicProfileView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="p-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                {user?.avatar_url ? (
                  <img
                    src={getImageUrl(user.avatar_url)}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary-600 text-white text-3xl font-bold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user?.username}</h2>
              <p className="text-gray-600">{ROLE_LABELS[user?.role]}</p>
              <p className="text-sm text-gray-500 mt-1">
                Membro desde {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Informações de Contato</h3>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{user?.email}</span>
                {user?.email_verified_at && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Estatísticas</h3>
              <div className="flex gap-4 text-sm">
                <div>
                  <p className="font-medium">Posts</p>
                  <p className="text-gray-600">24</p>
                </div>
                <div>
                  <p className="font-medium">Seguidores</p>
                  <p className="text-gray-600">128</p>
                </div>
                <div>
                  <p className="font-medium">Seguindo</p>
                  <p className="text-gray-600">56</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold text-gray-900 mb-3">Biografia</h3>
            <p className="text-gray-600">
              {user?.bio || 'Este usuário ainda não adicionou uma biografia.'}
            </p>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Atividade Recente</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Post publicado</p>
                <p className="text-xs text-gray-500">2 horas atrás</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Novo seguidor</p>
                <p className="text-xs text-gray-500">1 dia atrás</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Conquistas</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="w-10 h-10 mx-auto bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 text-lg mb-1">
                👤
              </div>
              <span className="text-xs font-medium">Perfil</span>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="w-10 h-10 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-lg mb-1">
                🔐
              </div>
              <span className="text-xs font-medium">Seguro</span>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="w-10 h-10 mx-auto bg-green-100 rounded-full flex items-center justify-center text-green-600 text-lg mb-1">
                ⭐
              </div>
              <span className="text-xs font-medium">Ativo</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  // Componente de Upload de Avatar com Drag & Drop (apenas no modo edição)
  const AvatarUploadWithDrop = () => (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition cursor-pointer ${
        dragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => document.getElementById('avatar-upload').click()}
    >
      <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600 mb-2">
        Arraste uma imagem aqui ou clique para selecionar
      </p>
      <p className="text-sm text-gray-500 mb-4">
        JPEG, PNG, GIF, WebP • Máx. 5MB
      </p>
      <Button type="button" variant="outline">
        Selecionar Arquivo
      </Button>
      <input
        id="avatar-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarChange}
      />
    </div>
  );

  return (
    <div className="container-custom py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header com Botão de Edição */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            {isEditing ? 'Editar Perfil' : 'Meu Perfil'}
          </h1>
          <Button
            onClick={handleEditToggle}
            variant={isEditing ? "secondary" : "primary"}
          >
            {isEditing ? (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Visualizar Perfil
              </>
            ) : (
              <>
                <Edit className="w-4 h-4 mr-2" />
                Editar Perfil
              </>
            )}
          </Button>
        </div>

        {/* Tabs - Mostrar apenas se estiver editando */}
        {isEditing && (
          <div className="flex gap-1 mb-8 border-b overflow-x-auto">
            {currentTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 pb-3 px-4 font-medium transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-b-2 border-primary-600 text-primary-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Conteúdo Principal */}
        {!isEditing ? (
          <PublicProfileView />
        ) : (
          <>
            {/* Profile Tab - Modo Edição */}
            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="p-6">
                    <form onSubmit={handleSubmitProfile(handleProfileUpdate)} className="space-y-6">
                      {/* Verificação de Email */}
                      {!user?.email_verified_at && (
                        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <Mail className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-yellow-800">Email não verificado</span>
                            <p className="text-sm text-yellow-700">Verifique seu email para acessar todos os recursos</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            loading={emailVerification.loading}
                            disabled={emailVerification.sent}
                            onClick={handleSendVerification}
                          >
                            {emailVerification.sent ? 'Enviado' : 'Verificar'}
                          </Button>
                        </div>
                      )}

                      {/* Avatar Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Foto do Perfil
                        </label>
                        <AvatarUploadWithDrop />
                        
                        {/* Preview do Avatar */}
                        {(avatarPreview || user?.avatar_url) && (
                          <div className="flex items-center gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
                            <div className="relative">
                              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 border-2 border-white shadow-sm">
                                <img
                                  src={avatarPreview || getImageUrl(user.avatar_url)}
                                  alt="Avatar preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {avatarFile ? 'Nova imagem selecionada' : 'Imagem atual'}
                              </p>
                              {avatarFile && (
                                <p className="text-sm text-green-600">
                                  ✅ {avatarFile.name} ({(avatarFile.size / 1024 / 1024).toFixed(2)} MB)
                                </p>
                              )}
                            </div>
                            {avatarFile && (
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={handleRemoveAvatar}
                              >
                                Remover
                              </Button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Informações Básicas */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Nome de usuário"
                          icon={User}
                          error={errorsProfile.username?.message}
                          {...registerProfile('username', {
                            required: 'Nome de usuário é obrigatório',
                            minLength: {
                              value: 3,
                              message: 'Nome deve ter no mínimo 3 caracteres'
                            }
                          })}
                        />

                        <Input
                          label="Email"
                          type="email"
                          icon={Mail}
                          error={errorsProfile.email?.message}
                          {...registerProfile('email', {
                            required: 'Email é obrigatório',
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: 'Email inválido'
                            }
                          })}
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => {
                            resetProfile();
                            setAvatarFile(null);
                            setAvatarPreview(null);
                          }}
                        >
                          Descartar
                        </Button>
                        <Button 
                          type="submit" 
                          loading={loading}
                          disabled={!avatarFile && !errorsProfile}
                        >
                          Salvar Alterações
                        </Button>
                      </div>
                    </form>
                  </Card>
                </div>

                {/* Sidebar - Informações da Conta */}
                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Informações da Conta</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Membro desde</p>
                        <p className="font-medium">
                          {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Função</p>
                        <p className="font-medium">{ROLE_LABELS[user?.role]}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="font-medium text-green-700">Ativo</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Alteração de Senha */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Alterar Senha</h3>
                  <form onSubmit={handleSubmitPassword(handlePasswordChange)} className="space-y-4">
                    <Input
                      label="Senha Atual"
                      type="password"
                      placeholder="••••••••"
                      icon={Lock}
                      error={errorsPassword.currentPassword?.message}
                      {...registerPassword('currentPassword', {
                        required: 'Senha atual é obrigatória'
                      })}
                    />

                    <Input
                      label="Nova Senha"
                      type="password"
                      placeholder="••••••••"
                      icon={Key}
                      error={errorsPassword.newPassword?.message}
                      {...registerPassword('newPassword', {
                        required: 'Nova senha é obrigatória',
                        minLength: {
                          value: 6,
                          message: 'Senha deve ter no mínimo 6 caracteres'
                        }
                      })}
                    />

                    <Input
                      label="Confirmar Nova Senha"
                      type="password"
                      placeholder="••••••••"
                      icon={Lock}
                      error={errorsPassword.confirmPassword?.message}
                      {...registerPassword('confirmPassword', {
                        required: 'Confirmação de senha é obrigatória',
                        validate: value =>
                          value === password || 'As senhas não coincidem'
                      })}
                    />

                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => resetPassword()}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" loading={loading}>
                        Alterar Senha
                      </Button>
                    </div>
                  </form>
                </Card>

                {/* Autenticação de Dois Fatores */}
                <Card className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Autenticação de Dois Fatores
                      </h3>
                      <p className="text-sm text-gray-600">
                        Adicione uma camada extra de segurança à sua conta
                      </p>
                    </div>
                    <ShieldCheck className="w-6 h-6 text-gray-400" />
                  </div>

                  {twoFA.enabled ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">2FA Ativado</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Sua conta está protegida com autenticação de dois fatores.
                      </p>
                      <Button variant="danger" onClick={disable2FA}>
                        Desativar 2FA
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <XCircle className="w-5 h-5" />
                        <span className="font-medium">2FA Desativado</span>
                      </div>
                      <Button 
                        onClick={enable2FA}
                        loading={twoFA.settingUp}
                        className="w-full"
                      >
                        Ativar Autenticação de Dois Fatores
                      </Button>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* Sessions Tab */}
            {activeTab === 'sessions' && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Sessões Ativas</h3>
                    <p className="text-sm text-gray-600">
                      Gerencie suas sessões ativas em diferentes dispositivos
                    </p>
                  </div>
                  <Button variant="danger" onClick={revokeAllSessions} disabled={sessions.length <= 1}>
                    Encerrar Todas as Outras Sessões
                  </Button>
                </div>

                {loadingSessions ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Carregando sessões...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <Monitor className="w-6 h-6 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium">{session.device}</p>
                            <p className="text-sm text-gray-600">
                              {session.browser} • {session.location}
                            </p>
                            <p className="text-xs text-gray-500">
                              Última atividade: {new Date(session.last_activity).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {session.current && (
                            <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
                              Esta sessão
                            </span>
                          )}
                          {!session.current && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => revokeSession(session.id)}
                            >
                              Encerrar
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notificações</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Notificações por Email</p>
                        <p className="text-sm text-gray-600">Receba atualizações importantes por email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.email_notifications}
                          onChange={(e) => updatePreferences({
                            ...preferences,
                            email_notifications: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Notificações Push</p>
                        <p className="text-sm text-gray-600">Receba notificações no navegador</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.push_notifications}
                          onChange={(e) => updatePreferences({
                            ...preferences,
                            push_notifications: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferências Gerais</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Idioma
                      </label>
                      <select
                        value={preferences.language}
                        onChange={(e) => updatePreferences({
                          ...preferences,
                          language: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="pt-BR">Português (Brasil)</option>
                        <option value="en-US">English (US)</option>
                        <option value="es-ES">Español</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fuso Horário
                      </label>
                      <select
                        value={preferences.timezone}
                        onChange={(e) => updatePreferences({
                          ...preferences,
                          timezone: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="America/Sao_Paulo">Brasília (UTC-3)</option>
                        <option value="America/New_York">New York (UTC-5)</option>
                        <option value="Europe/London">London (UTC+0)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tema
                      </label>
                      <select
                        value={preferences.theme}
                        onChange={(e) => updatePreferences({
                          ...preferences,
                          theme: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="light">Claro</option>
                        <option value="dark">Escuro</option>
                        <option value="system">Sistema</option>
                      </select>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Exportação de Dados</h3>
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Exporte todos os seus dados pessoais em formato JSON. Isso inclui suas informações de perfil, atividades e configurações.
                    </p>
                    <Button 
                      onClick={handleExportData}
                      loading={loading}
                      variant="outline"
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exportar Meus Dados
                    </Button>
                  </div>
                </Card>

                <Card className="p-6 border-red-200">
                  <div className="flex items-start gap-3 mb-4">
                    <Trash2 className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Excluir Conta</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente removidos.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Input
                      label={`Digite "CONFIRMAR" para excluir sua conta`}
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder="CONFIRMAR"
                    />
                    <Button 
                      variant="danger"
                      onClick={() => setShowDeleteModal(true)}
                      disabled={deleteConfirm !== 'CONFIRMAR'}
                      className="w-full"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir Minha Conta Permanentemente
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <Card className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Assinatura</h3>
                    <p className="text-gray-600">Gerencie sua assinatura e método de pagamento</p>
                  </div>
                  <CreditCard className="w-6 h-6 text-gray-400" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 border-2 border-primary-200 rounded-lg bg-primary-50">
                    <h4 className="font-semibold text-primary-900 mb-2">Plano Atual</h4>
                    <p className="text-2xl font-bold text-primary-600 mb-2">Grátis</p>
                    <p className="text-primary-700 text-sm">
                      Acesso básico a todas as funcionalidades principais
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h5 className="font-semibold mb-2">Próximo Passo</h5>
                      <p className="text-sm text-gray-600 mb-3">
                        Atualize para o plano Premium para desbloquear recursos exclusivos
                      </p>
                      <Button className="w-full">
                        Ver Planos Premium
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Modal de Confirmação de Exclusão - AGORA DEFINIDO ANTES */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Excluir Conta Permanentemente"
        message="Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita e todos os seus dados serão perdidos."
        confirmText="Excluir Conta"
        danger={true}
      />

      {/* Modal de Configuração do 2FA */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Configurar Autenticação de Dois Fatores</h3>
            
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Escaneie o QR code com seu aplicativo autenticador
              </p>
              {twoFA.qrCode && (
                <img 
                  src={twoFA.qrCode} 
                  alt="QR Code para 2FA" 
                  className="mx-auto border rounded-lg"
                />
              )}
            </div>

            <div className="space-y-4">
              <Input
                label="Código de Verificação"
                placeholder="Digite o código de 6 dígitos"
                value={twoFA.verificationCode}
                onChange={(e) => setTwoFA(prev => ({ ...prev, verificationCode: e.target.value }))}
                maxLength={6}
              />

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setShow2FAModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirm2FA}
                  disabled={twoFA.verificationCode.length !== 6}
                  className="flex-1"
                >
                  Verificar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Profile;