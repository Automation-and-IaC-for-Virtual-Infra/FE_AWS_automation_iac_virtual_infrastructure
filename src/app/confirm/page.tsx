'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { CognitoUser } from 'amazon-cognito-identity-js'
import { userPool } from '@/lib/cognito'

export default function ConfirmPage() {
  const searchParams = useSearchParams()
  const emailFromUrl = searchParams.get('email')

  const [email, setEmail] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  // ✅ Lấy email từ URL hoặc localStorage
  useEffect(() => {
    if (emailFromUrl) {
      setEmail(emailFromUrl)
      localStorage.setItem('pendingEmail', emailFromUrl)
    } else {
      const storedEmail = localStorage.getItem('pendingEmail')
      if (storedEmail) setEmail(storedEmail)
    }
  }, [emailFromUrl])

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email) return setError('Không tìm thấy email để xác nhận')

    const user = new CognitoUser({
      Username: email,
      Pool: userPool,
    })

    user.confirmRegistration(code, true, (err) => {
      if (err) return setError(err.message || 'Xác minh thất bại')

      alert('✅ Xác nhận thành công! Vui lòng đăng nhập')
      localStorage.removeItem('pendingEmail')
      window.location.href = '/login'
    })
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleConfirm} style={styles.form}>
        <h2>Xác minh Email</h2>
        {email && (
          <p style={{ fontSize: 14, marginBottom: 5 }}>
            Email: <b>{email}</b>
          </p>
        )}
        {error && <p style={styles.error}>{error}</p>}

        <input
          style={styles.input}
          type="text"
          placeholder="Nhập mã xác minh"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />

        <button style={styles.button} type="submit">
          Xác nhận
        </button>
      </form>
    </div>
  )
}

const styles: any = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: '#f3f4f6',
  },
  form: {
    width: '350px',
    padding: '30px',
    borderRadius: '10px',
    background: 'white',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: '12px',
    margin: '10px 0',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '14px',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '15px',
  },
  error: { color: 'red', marginBottom: '10px' },
}
