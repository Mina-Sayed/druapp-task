"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Search, User, Send, MessageSquare, Plus, Loader } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { messagesApi } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
  };
  receiver: {
    id: string;
    name: string;
  };
  read: boolean;
  createdAt: string;
}

interface Conversation {
  user: {
    id: string;
    name: string;
  };
  lastMessage: Message;
  unreadCount: number;
}

interface UserForMessage {
  id: string;
  name: string;
  role: string;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sending, setSending] = useState(false);
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);
  const [users, setUsers] = useState<UserForMessage[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch conversations
  useEffect(() => {
    async function fetchConversations() {
      try {
        setLoading(true);
        const data = await messagesApi.getConversations();
        setConversations(data);
      } catch (error) {
        console.error("Error fetching conversations:", error);
        toast({
          title: "Error",
          description: "Failed to load conversations. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchConversations();
  }, [toast]);

  // Fetch messages when conversation changes
  useEffect(() => {
    async function fetchMessages() {
      if (!activeConversation) return;

      try {
        const data = await messagesApi.getConversation(activeConversation);
        setMessages(data);
        
        // Update unread count in conversations list
        setConversations(prevConversations =>
          prevConversations.map(conv =>
            conv.user.id === activeConversation
              ? { ...conv, unreadCount: 0 }
              : conv
          )
        );
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast({
          title: "Error",
          description: "Failed to load messages. Please try again.",
          variant: "destructive",
        });
      }
    }

    fetchMessages();
  }, [activeConversation, toast]);

  // Fetch users for new conversation
  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoadingUsers(true);
        const data = await messagesApi.getUsers();
        // Filter out current user
        const filteredUsers = data.filter((u: UserForMessage) => u.id !== user?.id);
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to load users. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoadingUsers(false);
      }
    }

    if (isNewConversationOpen) {
      fetchUsers();
    }
  }, [isNewConversationOpen, user?.id, toast]);

  const filteredConversations = conversations.filter((conversation) =>
    conversation.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !activeConversation || sending) return;

    try {
      setSending(true);
      const message = await messagesApi.sendMessage(activeConversation, newMessage.trim());
      
      // Update messages list
      setMessages(prev => [...prev, message]);
      
      // Update conversations list with new last message
      setConversations(prev =>
        prev.map(conv =>
          conv.user.id === activeConversation
            ? { ...conv, lastMessage: message }
            : conv
        )
      );
      
      // Clear input
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const startNewConversation = async (selectedUser: UserForMessage) => {
    try {
      // Send an initial message to start the conversation
      await messagesApi.sendMessage(selectedUser.id, "Started a new conversation");
      
      // Refresh conversations list
      const data = await messagesApi.getConversations();
      setConversations(data);
      
      // Set the active conversation to the new one
      setActiveConversation(selectedUser.id);
      
      // Close the modal
      setIsNewConversationOpen(false);
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Messages</h1>
        <Dialog open={isNewConversationOpen} onOpenChange={setIsNewConversationOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Conversation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start a New Conversation</DialogTitle>
              <DialogDescription>
                Select a user to start a new conversation with.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <div className="relative mb-4">
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full pl-10"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {loadingUsers ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => startNewConversation(user)}
                      className="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                    >
                      <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                        <User className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">No users found</p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="flex h-[600px]">
          {/* Conversations sidebar */}
          <div className="w-1/3 border-r">
            <div className="p-4 border-b">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="overflow-y-auto h-[calc(600px-73px)]">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.user.id}
                  onClick={() => setActiveConversation(conversation.user.id)}
                  className={`flex items-center p-4 border-b cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    activeConversation === conversation.user.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
                  }`}
                >
                  <div className="relative mr-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                    </div>
                    {conversation.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-medium truncate">{conversation.user.name}</h3>
                      <span className="text-xs text-gray-500">
                        {new Date(conversation.lastMessage.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {conversation.lastMessage.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message area */}
          <div className="flex-1 flex flex-col">
            {activeConversation ? (
              <>
                {/* Conversation header */}
                <div className="p-4 border-b flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center mr-3">
                    <User className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-medium">
                      {conversations.find((c) => c.user.id === activeConversation)?.user.name}
                    </h3>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender.id === user?.id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender.id === user?.id ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-700"
                        }`}
                      >
                        <p>{message.content}</p>
                        <p className={`text-xs mt-1 ${message.sender.id === user?.id ? "text-blue-100" : "text-gray-500"}`}>
                          {new Date(message.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center h-full text-center p-4">
                <MessageSquare className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-xl font-medium mb-2">No conversation selected</h3>
                <p className="text-gray-500 max-w-md">Select a conversation from the list or start a new one to begin messaging.</p>
              </div>
            )}

            {/* Message input - Now always visible */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2 max-w-4xl mx-auto">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={activeConversation ? "Type your message..." : "Select a conversation to start messaging"}
                  disabled={!activeConversation || sending}
                  className="flex-1 h-10 px-4 rounded-md border bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
                <Button 
                  type="submit" 
                  disabled={!activeConversation || !newMessage.trim() || sending}
                  className="h-10"
                >
                  {sending ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    "Send"
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 