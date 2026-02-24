
import React from 'react';
import { Question, Objective, Failure } from '../types';
import { LayoutGrid, Target, AlertTriangle, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';

interface DashboardViewProps {
  questions: Question[];
  objectives: Objective[];
  failures: Failure[];
  onNavigateToView: (view: 'QA' | 'OKR' | 'GRAPH' | 'FAILURE') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  questions,
  objectives,
  failures,
  onNavigateToView
}) => {
  const totalQuestions = questions.length;
  const answeredQuestions = questions.filter(q => q.status === 'Answered').length;
  const verifiedQuestions = questions.filter(q => q.status === 'Verified').length;
  
  const totalObjectives = objectives.length;
  const completedObjectives = objectives.filter(o => 
    o.keyResults.some(kr => kr.status === 'Completed')
  ).length;
  
  const totalKRs = objectives.reduce((acc, o) => acc + o.keyResults.length, 0);
  const completedKRs = objectives.reduce((acc, o) => 
    acc + o.keyResults.filter(kr => kr.status === 'Completed').length
  , 0);
  
  const totalFailures = failures.length;
  const sedimentedFailures = failures.filter(f => f.status === 'Sedimented').length;
  const pendingFailures = failures.filter(f => f.status === 'New').length;

  const StatCard = ({ 
    title, 
    value, 
    subValue, 
    icon: Icon, 
    color, 
    onClick 
  }: { 
    title: string; 
    value: number; 
    subValue?: string;
    icon: any; 
    color: string;
    onClick?: () => void;
  }) => (
    <div 
      onClick={onClick}
      className={`p-6 rounded-2xl apple-glass cursor-pointer hover:scale-105 transition-transform ${onClick ? '' : 'pointer-events-none'}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-${color}/20`}>
          <Icon className={`text-${color}`} size={24} />
        </div>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400">{title}</div>
      {subValue && <div className="text-xs text-gray-500 mt-1">{subValue}</div>}
    </div>
  );

  const ProgressBar = ({ value, max, color }: { value: number; max: number; color: string }) => {
    const percent = max > 0 ? (value / max) * 100 : 0;
    return (
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-${color} transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
    );
  };

  return (
    <div className="p-6 md:p-10 overflow-auto h-full">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2 font-serif">Dashboard</h1>
        <p className="text-gray-400 mb-8">全局概览 - 您的知识生态系统</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="问题总数" 
            value={totalQuestions}
            subValue={`${answeredQuestions} 已回答 | ${verifiedQuestions} 已验证`}
            icon={LayoutGrid} 
            color="cosmic-blue"
            onClick={() => onNavigateToView('QA')}
          />
          <StatCard 
            title="目标数" 
            value={totalObjectives}
            subValue={`${completedObjectives} 进行中`}
            icon={Target} 
            color="cosmic-purple"
            onClick={() => onNavigateToView('OKR')}
          />
          <StatCard 
            title="KR 进度" 
            value={completedKRs}
            subValue={`/ ${totalKRs} 总计`}
            icon={TrendingUp} 
            color="cosmic-cyan"
          />
          <StatCard 
            title="待处理失败" 
            value={pendingFailures}
            subValue={`${sedimentedFailures} 已沉淀`}
            icon={AlertTriangle} 
            color="cosmic-crimson"
            onClick={() => onNavigateToView('FAILURE')}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl apple-glass">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Target className="text-cosmic-purple" size={20} />
              OKR 进度
            </h2>
            <div className="space-y-4">
              {objectives.slice(0, 5).map(obj => {
                const completed = obj.keyResults.filter(kr => kr.status === 'Completed').length;
                const total = obj.keyResults.length;
                return (
                  <div key={obj.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300 truncate">{obj.title}</span>
                      <span className="text-gray-500">{completed}/{total}</span>
                    </div>
                    <ProgressBar value={completed} max={total} color="cosmic-purple" />
                  </div>
                );
              })}
              {objectives.length === 0 && (
                <p className="text-gray-500 text-center py-4">暂无目标</p>
              )}
            </div>
          </div>

          <div className="p-6 rounded-2xl apple-glass">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="text-cosmic-blue" size={20} />
              最近活动
            </h2>
            <div className="space-y-3">
              {questions.slice(0, 5).map(q => (
                <div key={q.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
                  {q.status === 'Verified' ? (
                    <CheckCircle className="text-green-500" size={16} />
                  ) : q.status === 'Answered' ? (
                    <CheckCircle className="text-cosmic-blue" size={16} />
                  ) : (
                    <Clock className="text-gray-500" size={16} />
                  )}
                  <span className="text-gray-300 truncate flex-1">{q.title}</span>
                  <span className="text-xs text-gray-500">{new Date(q.updatedAt).toLocaleDateString()}</span>
                </div>
              ))}
              {questions.length === 0 && (
                <p className="text-gray-500 text-center py-4">暂无问题</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
