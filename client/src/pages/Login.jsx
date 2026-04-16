import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await API.post('/login', form)
      login(res.data.token, res.data.user)
      toast.success(`Welcome back, ${res.data.user.username}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-surface-950 flex">
      <div className="hidden lg:flex flex-col w-[420px] bg-surface-900 border-r border-surface-600/40 p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{background:'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.3) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(20,184,166,0.2) 0%, transparent 50%)'}} />
        <div className="relative z-10 flex items-center gap-3 mb-auto">
          <div className="w-9 h-9 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <span className="font-display font-bold text-white text-xl">RBAC System</span>
        </div>
        <div className="relative z-10 mt-auto">
          <h2 className="font-display text-3xl font-bold text-white mb-3 leading-tight">Secure access<br/>control at scale</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">Role-based permissions with JWT authentication. Every action is verified server-side.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-white mb-2">Sign in</h1>
            <p className="text-slate-400 text-sm">Enter your credentials to access your workspace</p>
          </div>
          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 font-display">Username</label>
              <input className="input-field" type="text" placeholder="your_username" value={form.username}
                onChange={e=>setForm({...form,username:e.target.value})} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 font-display">Password</label>
              <input className="input-field" type="password" placeholder="••••••••" value={form.password}
                onChange={e=>setForm({...form,password:e.target.value})} required />
            </div>
            <div className="pt-2">
              <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Signing in…' : 'Sign in'}</button>
            </div>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent-light hover:text-white font-semibold transition-colors">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}