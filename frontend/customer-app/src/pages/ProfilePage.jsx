import { motion } from 'framer-motion'

const ProfilePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold gradient-text mb-4">Profile</h1>
          <p className="text-gray-600 dark:text-gray-400">
            User profile management coming soon...
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default ProfilePage