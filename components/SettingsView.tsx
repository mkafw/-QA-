
import React from 'react';
import { Settings, Key, Palette, Database, Info, ExternalLink } from 'lucide-react';

interface SettingsViewProps {
  onClose: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onClose }) => {
  const Section = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
    <div className="p-6 rounded-2xl apple-glass mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Icon className="text-cosmic-blue" size={20} />
        <h2 className="text-lg font-bold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );

  const SettingRow = ({ label, value, onClick }: { label: string; value?: string; onClick?: () => void }) => (
    <div 
      className={`flex items-center justify-between py-3 border-b border-white/5 ${onClick ? 'cursor-pointer hover:bg-white/5 -mx-4 px-4' : ''}`}
      onClick={onClick}
    >
      <span className="text-gray-300">{label}</span>
      {value && <span className="text-gray-500 text-sm">{value}</span>}
    </div>
  );

  return (
    <div className="p-6 md:p-10 overflow-auto h-full">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white font-serif">Settings</h1>
        </div>

        <Section title="API 配置" icon={Database}>
          <SettingRow label="数据源" value="Cloudflare Workers + GitHub" />
          <SettingRow label="API 地址" value="qa-os-api.tiklt1.workers.dev" />
          <div className="pt-2">
            <a 
              href="https://dash.cloudflare.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-cosmic-blue hover:underline text-sm"
            >
              <ExternalLink size={14} />
              管理 Cloudflare Workers
            </a>
          </div>
        </Section>

        <Section title="加密设置" icon={Key}>
          <SettingRow label="加密方式" value="AES-GCM + PBKDF2" />
          <SettingRow label="密钥" value="本地管理" />
          <div className="pt-2 text-xs text-gray-500">
            加密密钥仅存储在本地，不会发送到服务器
          </div>
        </Section>

        <Section title="外观" icon={Palette}>
          <SettingRow label="主题" value="Cosmic Dark" />
          <SettingRow label="字体" value="Cinzel / Inter / JetBrains Mono" />
        </Section>

        <Section title="关于" icon={Info}>
          <SettingRow label="版本" value="1.0.0" />
          <SettingRow label="技术栈" value="React + D3.js + Vite" />
          <SettingRow label="存储" value="GitHub Issues (加密)" />
        </Section>
      </div>
    </div>
  );
};
