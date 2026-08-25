export interface User { id: string; email: string; role: 'ADMIN' | 'MEMBER'; }
export interface AuthSession { token: string; user: User; }