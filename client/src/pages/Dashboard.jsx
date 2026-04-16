import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import API from '../api/axios'

const permMap = {
  admin:  { view:true, create:true, edit:true, delete:true, users:true },
  editor: { view:true, create:true, edit:true, delete:false, users:false },
  viewer: { view:true, create:false, edit:false, delete:false, users:false },
}
const permLabels = [
  ['view',   'View content',   '#14B8A6'],
  ['create', 'Create content', '#6366F1'],
  ['edit',   'Edit content',   '#F59E0B'],
  ['delete', 'Delete content', '#F43F5E'],
  ['users',  'Manage users',   '#818CF8'],
]
const roleMeta = {
  admin:  { color:'#818CF8', bg:'rgba(99,102,241,0.12)',  label:'Administrator' },
  editor: { color:'#14B8A6', bg:'rgba(20,184,166,0.1)',   label:'Editor'        },
  viewer: { color:'#94A3B8', bg:'rgba(148,163,184,0.08)', label:'Viewer'        },
}

export default function Dashboard() {
  const { user } = useAuth()
  const perms = permMap[user?.role] || {}
  const meta  = roleMeta[user?.role] || roleMeta.viewer
  const [contentCount, setContentCount] = useState('—')
  const grantedCount = Object.values(perms).filter(Boolean).length

  useEffect(() => {
    API.get('/content').then(r => setContentCount(r.data?.length ?? 0)).catch(() => {})
  }, [])

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-10">
        <div>
          <p className="text-slate-500 text-sm mb-1 font-display tracking-wide">Welcome back,</p>
          <h1 className="font-display text-4xl font-bold text-white leading-tight">{user?.username}</h1>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold font-display self-start"
          style={{background:meta.bg, color:meta.color, border:`1px solid ${meta.color}33`}}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{background:meta.color}}></span>
          {meta.label}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          ['Role', user?.role?.toUpperCase(), 'Current access level', meta.color],
          ['Content', contentCount, 'Items accessible', '#6366F1'],
          ['Permissions', `${grantedCount} / 5`, 'Actions granted', '#14B8A6'],
        ].map(([label, value, sub, color]) => (
          <div key={label} className="glass rounded-2xl p-5 transition-all hover:scale-[1.01]" style={{borderColor:`${color}20`}}>
            <p className="text-xs font-display font-semibold uppercase tracking-widest mb-3" style={{color}}>{label}</p>
            <p className="text-3xl font-display font-bold text-white mb-1 capitalize">{value}</p>
            <p className="text-xs text-slate-600">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Permissions */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-display font-semibold text-white text-lg mb-6">Your permissions</h2>
          <div className="space-y-3">
            {permLabels.map(([key, label, color]) => (
              <div key={key} className="flex items-center gap-4 group">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all"
                  style={perms[key]
                    ? {background:`${color}18`, color, border:`1px solid ${color}30`}
                    : {background:'rgba(255,255,255,0.03)', color:'#374151', border:'1px solid rgba(255,255,255,0.05)'}}>
                  {perms[key] ? '✓' : '✕'}
                </div>
                <span className={`text-sm flex-1 ${perms[key] ? 'text-slate-200' : 'text-slate-600'}`}>{label}</span>
                <span className={`text-xs font-display font-semibold px-2.5 py-1 rounded-full`}
                  style={perms[key]
                    ? {background:`${color}15`, color}
                    : {background:'rgba(255,255,255,0.03)', color:'#374151'}}>
                  {perms[key] ? 'Granted' : 'Denied'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Account info */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-display font-semibold text-white text-lg mb-6">Account details</h2>
          <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-surface-800/50 border border-surface-600/40">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold font-display flex-shrink-0"
              style={{background:`linear-gradient(135deg, #6366F1, #14B8A6)`}}>
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-display font-bold text-white text-lg leading-tight">{user?.username}</p>
              <p className="text-sm text-slate-500">{user?.email}</p>
              <span className="text-xs font-display font-semibold px-2 py-0.5 rounded-full mt-1 inline-block capitalize"
                style={{background:meta.bg, color:meta.color, border:`1px solid ${meta.color}33`}}>
                {user?.role}
              </span>
            </div>
          </div>
          <div className="space-y-0 divide-y divide-surface-600/30">
            {[['User ID', `#${user?.id}`], ['Username', user?.username], ['Email', user?.email], ['Role', user?.role]].map(([k,v])=>(
              <div key={k} className="flex items-center justify-between py-3">
                <span className="text-xs text-slate-600 font-display uppercase tracking-wider">{k}</span>
                <span className="text-sm text-slate-300 font-medium capitalize">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}