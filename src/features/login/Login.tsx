import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Login() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted">
      <h1 className="text-4xl font-bold mb-8">Login</h1>
      <form className="bg-background p-8 rounded-lg shadow-lg w-full max-w-sm space-y-6">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" type="text" placeholder="Username" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="Password" />
        </div>
        <Button type="submit" className="w-full">
          Login
        </Button>
      </form>
    </div>
  )
}
