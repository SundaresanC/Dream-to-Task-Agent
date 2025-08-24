import mongoose from "mongoose"

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/dream-task-agent"

let isConnected = false

export async function connectToDatabase() {
  if (isConnected) {
    return
  }

  try {
    await mongoose.connect(MONGODB_URI)
    isConnected = true
    console.log("Connected to MongoDB")
  } catch (error) {
    console.error("MongoDB connection error:", error)
    throw error
  }
}

// User Schema
const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    passwordHash: { type: String, required: true },
  },
  {
    timestamps: true,
  },
)

// Goal Schema
const goalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    timeframe: { type: String, required: true },
    category: { type: String, default: "personal" },
    priority: { type: String, default: "medium" },
    status: { type: String, default: "active" },
    progress: { type: Number, default: 0 },
    targetDate: { type: Date },
    aiAnalysis: { type: String },
  },
  {
    timestamps: true,
  },
)

// Task Schema
const taskSchema = new mongoose.Schema(
  {
    goalId: { type: mongoose.Schema.Types.ObjectId, ref: "Goal", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, default: "pending" },
    priority: { type: String, default: "medium" },
    category: { type: String, required: true },
    estimatedHours: { type: Number, default: 0 },
    progress: { type: Number, default: 0 },
    dueDate: { type: Date },
    completedAt: { type: Date },
    dependencies: [{ type: String }],
    tags: [{ type: String }],
  },
  {
    timestamps: true,
  },
)

// Integration Schema
const integrationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    platformId: { type: String, required: true },
    platformName: { type: String, required: true },
    status: { type: String, default: "disconnected" },
    accessToken: { type: String },
    refreshToken: { type: String },
    settings: { type: mongoose.Schema.Types.Mixed, default: {} },
    lastSync: { type: Date },
  },
  {
    timestamps: true,
  },
)

// Agent Workflow Schema
const agentWorkflowSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    goalId: { type: mongoose.Schema.Types.ObjectId, ref: "Goal" },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
    workflowType: { type: String, required: true },
    status: { type: String, default: "pending" },
    inputData: { type: mongoose.Schema.Types.Mixed, required: true },
    outputData: { type: mongoose.Schema.Types.Mixed },
    errorMessage: { type: String },
    startedAt: { type: Date },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
  },
)

// App Content Schema - for dynamic UI text and branding
const appContentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
    category: { type: String, required: true }, // 'branding', 'ui', 'messages', 'templates'
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
)

// User Preferences Schema - for personalized settings
const userPreferencesSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    theme: { type: String, default: "light" },
    language: { type: String, default: "en" },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      taskReminders: { type: Boolean, default: true },
      goalUpdates: { type: Boolean, default: true },
    },
    dashboard: {
      layout: { type: String, default: "default" },
      widgets: [{ type: String }],
      showStats: { type: Boolean, default: true },
    },
    ai: {
      complexity: { type: String, default: "balanced" }, // 'simple', 'balanced', 'detailed'
      creativity: { type: Number, default: 0.7 },
      autoSchedule: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  },
)

// User Stats Schema - for dynamic dashboard metrics
const userStatsSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    goalsCreated: { type: Number, default: 0 },
    goalsCompleted: { type: Number, default: 0 },
    tasksCreated: { type: Number, default: 0 },
    tasksCompleted: { type: Number, default: 0 },
    totalHoursLogged: { type: Number, default: 0 },
    streakDays: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: Date.now },
    monthlyStats: [
      {
        month: { type: String, required: true }, // 'YYYY-MM'
        goalsCreated: { type: Number, default: 0 },
        tasksCompleted: { type: Number, default: 0 },
        hoursLogged: { type: Number, default: 0 },
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Content Templates Schema - for reusable content
const contentTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true }, // 'goal', 'task', 'email', 'notification'
    template: { type: String, required: true },
    variables: [{ type: String }], // placeholders like {userName}, {goalTitle}
    isDefault: { type: Boolean, default: false },
    usageCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
)

// Models
const User = mongoose.models.User || mongoose.model("User", userSchema)
const Goal = mongoose.models.Goal || mongoose.model("Goal", goalSchema)
const Task = mongoose.models.Task || mongoose.model("Task", taskSchema)
const Integration = mongoose.models.Integration || mongoose.model("Integration", integrationSchema)
const AgentWorkflow = mongoose.models.AgentWorkflow || mongoose.model("AgentWorkflow", agentWorkflowSchema)
const AppContent = mongoose.models.AppContent || mongoose.model("AppContent", appContentSchema)
const UserPreferences = mongoose.models.UserPreferences || mongoose.model("UserPreferences", userPreferencesSchema)
const UserStats = mongoose.models.UserStats || mongoose.model("UserStats", userStatsSchema)
const ContentTemplate = mongoose.models.ContentTemplate || mongoose.model("ContentTemplate", contentTemplateSchema)

// Session Schema
const sessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  },
)

const Session = mongoose.models.Session || mongoose.model("Session", sessionSchema)

export const dbOperations = {
  // User operations
  createUser: async (user: { email: string; name: string; passwordHash: string }) => {
    await connectToDatabase()
    const newUser = new User(user)
    return await newUser.save()
  },

  getUserByEmail: async (email: string) => {
    await connectToDatabase()
    return await User.findOne({ email })
  },

  getUserById: async (id: string) => {
    await connectToDatabase()
    return await User.findById(id)
  },

  updateUser: async (id: string, updates: Partial<{ name: string; email: string }>) => {
    await connectToDatabase()
    return await User.findByIdAndUpdate(id, updates, { new: true })
  },

  // Session operations
  createSession: async (session: { sessionId: string; userId: string; expiresAt: Date }) => {
    await connectToDatabase()
    const newSession = new Session(session)
    return await newSession.save()
  },

  getSession: async (sessionId: string) => {
    await connectToDatabase()
    return await Session.findOne({ sessionId })
  },

  deleteSession: async (sessionId: string) => {
    await connectToDatabase()
    return await Session.findOneAndDelete({ sessionId })
  },

  // App Content operations
  getAllAppContent: async () => {
    await connectToDatabase()
    return await AppContent.find({ isActive: true })
  },

  updateAppContent: async (key: string, value: string) => {
    await connectToDatabase()
    return await AppContent.findOneAndUpdate(
      { key },
      { value, isActive: true },
      { upsert: true, new: true }
    )
  },

  // Integration operations
  getIntegrationByPlatformId: async (userId: string, platformId: string) => {
    await connectToDatabase()
    return await Integration.findOne({ userId, platformId })
  },

  updateIntegration: async (id: string, updates: any) => {
    await connectToDatabase()
    return await Integration.findByIdAndUpdate(id, updates, { new: true })
  },

  // Goal operations
  createGoal: async (goal: {
    userId: string
    title: string
    description: string
    timeframe: string
    category?: string
    priority?: string
    targetDate?: Date
    aiAnalysis?: string
  }) => {
    await connectToDatabase()
    const newGoal = new Goal(goal)
    return await newGoal.save()
  },

  getGoalsByUserId: async (userId: string) => {
    await connectToDatabase()
    return await Goal.find({ userId }).sort({ createdAt: -1 })
  },

  getGoalById: async (id: string) => {
    await connectToDatabase()
    return await Goal.findById(id)
  },

  updateGoal: async (id: string, updates: Partial<{ 
    status: string; 
    aiAnalysis: string; 
    title: string; 
    description: string; 
    category: string; 
    priority: string; 
    targetDate: Date; 
    progress: number;
  }>) => {
    await connectToDatabase()
    return await Goal.findByIdAndUpdate(id, updates, { new: true })
  },

  deleteGoal: async (id: string) => {
    await connectToDatabase()
    return await Goal.findByIdAndDelete(id)
  },

  // Task operations
  createTask: async (task: {
    goalId: string
    userId: string
    title: string
    description: string
    priority: string
    category: string
    estimatedHours: number
    dueDate?: Date
    dependencies?: string[]
    tags?: string[]
  }) => {
    await connectToDatabase()
    const newTask = new Task(task)
    return await newTask.save()
  },

  getTasksByUserId: async (userId: string) => {
    await connectToDatabase()
    return await Task.find({ userId }).populate("goalId", "title").sort({ createdAt: -1 })
  },

  getTaskById: async (id: string) => {
    await connectToDatabase()
    return await Task.findById(id).populate("goalId", "title")
  },

  updateTask: async (
    id: string,
    updates: Partial<{
      status: string
      progress: number
      completedAt: Date
      title: string
      description: string
      priority: string
      category: string
      estimatedHours: number
      dueDate: Date
    }>,
  ) => {
    await connectToDatabase()
    return await Task.findByIdAndUpdate(id, updates, { new: true })
  },

  deleteTask: async (id: string) => {
    await connectToDatabase()
    return await Task.findByIdAndDelete(id)
  },

  // Integration operations
  createIntegration: async (integration: {
    userId: string
    platformId: string
    platformName: string
    accessToken?: string
    settings?: object
  }) => {
    await connectToDatabase()
    const newIntegration = new Integration({
      ...integration,
      status: "connected",
    })
    return await newIntegration.save()
  },

  getIntegrationsByUserId: async (userId: string) => {
    await connectToDatabase()
    return await Integration.find({ userId })
  },

  updateIntegration: async (
    id: string,
    updates: Partial<{
      status: string
      lastSync: Date
      settings: object
    }>,
  ) => {
    await connectToDatabase()
    return await Integration.findByIdAndUpdate(id, updates, { new: true })
  },

  // Agent workflow operations
  createWorkflow: async (workflow: {
    userId: string
    goalId?: string
    taskId?: string
    workflowType: string
    inputData: object
  }) => {
    await connectToDatabase()
    const newWorkflow = new AgentWorkflow({
      ...workflow,
      startedAt: new Date(),
    })
    return await newWorkflow.save()
  },

  updateWorkflow: async (
    id: string,
    updates: {
      status: string
      outputData?: object
      errorMessage?: string
      completedAt?: Date
    },
  ) => {
    await connectToDatabase()
    return await AgentWorkflow.findByIdAndUpdate(id, updates, { new: true })
  },

  getWorkflowsByUserId: async (userId: string) => {
    await connectToDatabase()
    return await AgentWorkflow.find({ userId }).sort({ createdAt: -1 })
  },

  // App Content operations
  getAppContent: async (key?: string) => {
    await connectToDatabase()
    if (key) {
      return await AppContent.findOne({ key, isActive: true })
    }
    return await AppContent.find({ isActive: true })
  },

  updateAppContent: async (key: string, value: string) => {
    await connectToDatabase()
    return await AppContent.findOneAndUpdate({ key }, { value, updatedAt: new Date() }, { new: true, upsert: true })
  },

  // User Preferences operations
  getUserPreferences: async (userId: string) => {
    await connectToDatabase()
    let prefs = await UserPreferences.findOne({ userId })
    if (!prefs) {
      prefs = new UserPreferences({ userId })
      await prefs.save()
    }
    return prefs
  },

  updateUserPreferences: async (userId: string, updates: object) => {
    await connectToDatabase()
    return await UserPreferences.findOneAndUpdate(
      { userId },
      { ...updates, updatedAt: new Date() },
      { new: true, upsert: true },
    )
  },

  // User Stats operations
  getUserStats: async (userId: string) => {
    await connectToDatabase()
    let stats = await UserStats.findOne({ userId })
    if (!stats) {
      stats = new UserStats({ userId })
      await stats.save()
    }
    return stats
  },

  updateUserStats: async (userId: string, updates: object) => {
    await connectToDatabase()
    return await UserStats.findOneAndUpdate(
      { userId },
      { ...updates, lastActiveDate: new Date() },
      { new: true, upsert: true },
    )
  },

  incrementUserStat: async (userId: string, field: string, amount = 1) => {
    await connectToDatabase()
    return await UserStats.findOneAndUpdate(
      { userId },
      {
        $inc: { [field]: amount },
        lastActiveDate: new Date(),
      },
      { new: true, upsert: true },
    )
  },

  // Content Template operations
  getContentTemplates: async (category?: string) => {
    await connectToDatabase()
    const query = category ? { category } : {}
    return await ContentTemplate.find(query).sort({ usageCount: -1 })
  },

  useContentTemplate: async (id: string, variables: object) => {
    await connectToDatabase()
    const template = await ContentTemplate.findByIdAndUpdate(id, { $inc: { usageCount: 1 } }, { new: true })

    if (!template) return null

    let content = template.template
    Object.entries(variables).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{${key}}`, "g"), String(value))
    })

    return { ...template.toObject(), renderedContent: content }
  },
}

export { User, Goal, Task, Integration, AgentWorkflow, AppContent, UserPreferences, UserStats, ContentTemplate }
