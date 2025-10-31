import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChartBarIcon, 
  EyeIcon, 
  ShoppingCartIcon, 
  UserGroupIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import { useWebSocket } from '../../hooks/useWebSocket'

const RealtimeDashboard = () => {
  const { 
    isConnected, 
    realtimeData, 
    onlineUsers, 
    chatMessages, 
    aiResponses,
    trackProductView,
    sendChatMessage,
    sendAIMessage
  } = useWebSocket()

  const [activeTab, setActiveTab] = useState('analytics')
  const [chatInput, setChatInput] = useState('')
  const [aiInput, setAiInput] = useState('')

  const handleChatSend = (e) => {
    e.preventDefault()
    if (chatInput.trim()) {
      sendChatMessage(chatInput.trim())
      setChatInput('')
    }
  }

  const handleAISend = (e) => {
    e.preventDefault()
    if (aiInput.trim()) {
      sendAIMessage(aiInput.trim(), 'dashboard')
      setAiInput('')
    }
  }

  const tabs = [
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
    { id: 'chat', name: 'Live Chat', icon: ChatBubbleLeftRightIcon },
    { id: 'ai', name: 'AI Assistant', icon: SparklesIcon }
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Real-time Dashboard
        </h2>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
          isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Online Users</p>
                    <p className="text-3xl font-bold">{onlineUsers.size}</p>
                  </div>
                  <UserGroupIcon className="h-12 w-12 text-blue-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Product Views</p>
                    <p className="text-3xl font-bold">
                      {Object.values(realtimeData.inventory || {}).reduce((sum, item) => sum + (item.viewCount || 0), 0)}
                    </p>
                  </div>
                  <EyeIcon className="h-12 w-12 text-green-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">AI Interactions</p>
                    <p className="text-3xl font-bold">{aiResponses.length}</p>
                  </div>
                  <SparklesIcon className="h-12 w-12 text-purple-200" />
                </div>
              </div>
            </div>

            {/* Real-time Data */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Live Product Data</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {Object.entries(realtimeData.inventory || {}).map(([productId, data]) => (
                    <div key={productId} className="flex items-center justify-between p-2 bg-white dark:bg-gray-600 rounded">
                      <span className="text-sm">Product {productId}</span>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                        <EyeIcon className="h-4 w-4" />
                        <span>{data.viewCount || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Price Updates</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {Object.entries(realtimeData.prices || {}).map(([productId, price]) => (
                    <div key={productId} className="flex items-center justify-between p-2 bg-white dark:bg-gray-600 rounded">
                      <span className="text-sm">Product {productId}</span>
                      <span className="text-sm font-semibold text-green-600">₹{price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-64 overflow-y-auto">
              <div className="space-y-2">
                {chatMessages.slice(0, 20).map((msg, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                      {msg.userId?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 dark:text-gray-400">{msg.userId}</div>
                      <div className="text-sm">{msg.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <form onSubmit={handleChatSend} className="flex space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
              />
              <button
                type="submit"
                disabled={!isConnected}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </motion.div>
        )}

        {activeTab === 'ai' && (
          <motion.div
            key="ai"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-64 overflow-y-auto">
              <div className="space-y-4">
                {aiResponses.slice(0, 10).map((response, index) => (
                  <div key={index} className="bg-white dark:bg-gray-600 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <SparklesIcon className="h-4 w-4 text-purple-500" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">AI Response</span>
                    </div>
                    <p className="text-sm">{response.message}</p>
                    {response.suggestions && response.suggestions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {response.suggestions.map((suggestion, i) => (
                          <span key={i} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                            {suggestion}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <form onSubmit={handleAISend} className="flex space-x-2">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Ask AI anything..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700"
              />
              <button
                type="submit"
                disabled={!isConnected}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
              >
                Ask AI
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default RealtimeDashboard