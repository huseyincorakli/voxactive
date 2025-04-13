"use client"

import { Avatar,  AvatarImage } from "@/components/ui/avatar"


interface UserResponseProps {
  message: string
}

export const UserResponse = ({ message }: UserResponseProps) => {
  return (
    <div className="flex justify-end mb-4">
      <div className="flex items-end gap-2 max-w-[80%]">
        <div className="bg-blue-600 text-white px-4 py-3 rounded-2xl rounded-br-none">
          <p className="text-sm">{message}</p>
        </div>
        <Avatar className="h-8 w-8 border-2 border-blue-500">
          <AvatarImage src="/user-avatar.png" alt="Kullanıcı" />
        </Avatar>
      </div>
    </div>
  )
}