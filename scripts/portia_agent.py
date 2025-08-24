#!/usr/bin/env python3
"""
Portia AI Agent for Dream-to-Task processing
Enhanced version with better Portia SDK integration, cloud logging, and production features
"""

import os
import sys
import json
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv(override=True)

PORTIA_AVAILABLE = False
try:
    from portia import Config, Portia, DefaultToolRegistry, Tool, Plan, PlanBuilder
    from portia.cli import CLIExecutionHooks
    from portia.tool_registry import ToolRegistry
    from portia import PlanRunState, Clarification, StorageClass, LogLevel
    from portia.end_user import EndUser
    config = Config.from_default(llm_provider="google")
    
    PORTIA_AVAILABLE = True
    
    # Check Portia version for compatibility
    try:
        import portia
        portia_version = getattr(portia, '__version__', 'unknown')
        print(f"[DEBUG] Portia SDK loaded successfully (version: {portia_version})", file=sys.stderr)
    except Exception:
        print("[DEBUG] Portia SDK loaded successfully (version unknown)", file=sys.stderr)
        
except ImportError as e:
    print(f"[DEBUG] Portia SDK not available: {e}", file=sys.stderr)
    print("[DEBUG] Running in fallback mode", file=sys.stderr)
    ENDUSER_AVAILABLE = False

class DreamTaskAgent:
    """Main agent class for processing dreams into actionable tasks"""
    
    def __init__(self, user_id: Optional[str] = None, enable_cloud_logging: bool = True):
        self.user_id = user_id or "default-user"
        self.enable_cloud_logging = enable_cloud_logging
        
        if PORTIA_AVAILABLE:
            try:
                # Load config safely (without requiring env vars upfront)
                self.config = Config.from_default(
                    llm_provider=os.getenv("LLM_PROVIDER", "google"),
                    default_model=os.getenv("DEFAULT_MODEL", os.getenv("GEMINI_MODEL", "google/gemini-2.5-flash")),
                    api_keys={
                        "gemini": os.getenv("GEMINI_API_KEY","AIzaSyDyZWCMNU2B-y3UGOl4fqWGkoXgG_F7xJ8"),
                    }
                )

                # Enable cloud logging if API key is present
                if enable_cloud_logging and os.getenv("PORTIA_API_KEY","prt-Efed6dNJ.qfVo5kEnKq7rQ8JeXx8SSE11MsePlYX4"):
                    try:
                        self.config.storage_class = StorageClass.CLOUD
                        print("[DEBUG] Cloud logging enabled", file=sys.stderr)
                    except Exception as e:
                        print(f"[DEBUG] Failed to enable cloud logging: {e}", file=sys.stderr)

                # Set log level from env (default: INFO)
                try:
                    log_level = os.getenv("PORTIA_LOG_LEVEL", "INFO").upper()
                    if log_level == "DEBUG":
                        self.config.default_log_level = LogLevel.DEBUG
                    elif log_level == "TRACE":
                        self.config.default_log_level = LogLevel.TRACE
                    print(f"[DEBUG] Log level set to: {log_level}", file=sys.stderr)
                except Exception as e:
                    print(f"[DEBUG] Failed to set log level: {e}", file=sys.stderr)

                # Debug info for LLM provider + model
                print(f"[DEBUG] LLM provider: {self.config.llm_provider}", file=sys.stderr)
                print(f"[DEBUG] Default model: {self.config.default_model}", file=sys.stderr)
                if not self.config.api_keys.get(self.config.llm_provider):
                    print(f"[DEBUG] Warning: API key for provider '{self.config.llm_provider}' not found", file=sys.stderr)

                # Initialize Portia
                self.tool_registry = DefaultToolRegistry(config=self.config)
                self.execution_hooks = CLIExecutionHooks()
                self.portia = Portia(
                    config=self.config,
                    tools=self.tool_registry,
                    execution_hooks=self.execution_hooks,
                )

                # Add custom tools
                self._register_custom_tools()
                print("[DEBUG] Portia agent initialized successfully", file=sys.stderr)

            except Exception as e:
                print(f"[DEBUG] Failed to initialize Portia: {e}", file=sys.stderr)
                self.portia = None
        else:
            self.portia = None
    
    def _register_custom_tools(self):
        """Register custom tools for dream-to-task processing"""
        if not PORTIA_AVAILABLE or not self.portia:
            return
        
        @Tool(
            name="analyze_goal_complexity",
            description="Analyze the complexity and feasibility of a user's goal or dream"
        )
        def analyze_goal_complexity(goal: str, timeframe: str) -> Dict[str, Any]:
            """Analyze goal complexity and provide insights with enhanced validation"""
            if not goal or not timeframe:
                raise ValueError("Goal and timeframe are required")
            
            complexity_factors = {
                "skill_requirements": [],
                "time_investment": "medium",
                "resource_needs": [],
                "difficulty_level": "intermediate",
                "success_probability": 0.7,
                "estimated_duration_weeks": 4,
                "risk_factors": []
            }
            
            # Enhanced complexity analysis
            goal_lower = goal.lower()
            word_count = len(goal.split())
            
            # Complexity based on goal length and content
            if word_count > 30:
                complexity_factors["difficulty_level"] = "advanced"
                complexity_factors["success_probability"] = 0.5
                complexity_factors["risk_factors"].append("overly complex goal")
            elif word_count > 15:
                complexity_factors["difficulty_level"] = "intermediate"
                complexity_factors["success_probability"] = 0.7
            
            # Skill-based goals
            if any(word in goal_lower for word in ["learn", "master", "become expert", "study"]):
                complexity_factors["skill_requirements"].extend(["continuous learning", "practice time"])
                complexity_factors["time_investment"] = "high"
                complexity_factors["estimated_duration_weeks"] = 12
                complexity_factors["risk_factors"].append("learning curve")
            
            # Business/startup goals
            if any(word in goal_lower for word in ["business", "startup", "company", "entrepreneur"]):
                complexity_factors["resource_needs"].extend(["funding", "team", "market research", "legal setup"])
                complexity_factors["difficulty_level"] = "advanced"
                complexity_factors["success_probability"] = 0.4
                complexity_factors["estimated_duration_weeks"] = 26
                complexity_factors["risk_factors"].extend(["market competition", "funding challenges"])
            
            # Health/fitness goals
            if any(word in goal_lower for word in ["fitness", "health", "exercise", "diet", "weight"]):
                complexity_factors["skill_requirements"].append("habit formation")
                complexity_factors["resource_needs"].extend(["gym access", "nutrition plan"])
                complexity_factors["estimated_duration_weeks"] = 8
                complexity_factors["risk_factors"].append("motivation maintenance")
            
            # Creative goals
            if any(word in goal_lower for word in ["create", "build", "design", "write", "paint"]):
                complexity_factors["skill_requirements"].append("creative skills")
                complexity_factors["resource_needs"].append("creative tools")
                complexity_factors["estimated_duration_weeks"] = 6
            
            return complexity_factors
        
        @Tool(
            name="generate_task_breakdown",
            description="Break down a goal into specific, actionable tasks with priorities and dependencies"
        )
        def generate_task_breakdown(goal: str, timeframe: str, complexity: Dict[str, Any]) -> List[Dict[str, Any]]:
            """Generate detailed task breakdown with enhanced categorization"""
            if not goal or not complexity:
                raise ValueError("Goal and complexity analysis are required")
            
            tasks = []
            goal_lower = goal.lower()
            difficulty = complexity.get("difficulty_level", "intermediate")
            
            # Research phase tasks (always included)
            tasks.append({
                "title": "Goal analysis and research",
                "description": f"Deep dive into requirements and best practices for: {goal}",
                "priority": "high",
                "estimated_hours": 4,
                "category": "research",
                "dependencies": [],
                "tags": ["research", "planning"]
            })
            
            # Learning/Skill-based goals
            if any(word in goal_lower for word in ["learn", "skill", "study", "master", "course"]):
                tasks.extend([
                    {
                        "title": "Find learning resources and courses",
                        "description": "Research and select the best learning materials, courses, and mentors",
                        "priority": "high",
                        "estimated_hours": 3,
                        "category": "research",
                        "dependencies": [],
                        "tags": ["learning", "resources"]
                    },
                    {
                        "title": "Create structured learning plan",
                        "description": "Develop a detailed study schedule with milestones and practice sessions",
                        "priority": "high",
                        "estimated_hours": 2,
                        "category": "planning",
                        "dependencies": ["Find learning resources and courses"],
                        "tags": ["planning", "schedule"]
                    },
                    {
                        "title": "Set up practice environment",
                        "description": "Create dedicated space and tools for consistent practice",
                        "priority": "medium",
                        "estimated_hours": 2,
                        "category": "setup",
                        "dependencies": ["Create structured learning plan"],
                        "tags": ["setup", "environment"]
                    },
                    {
                        "title": "Regular practice and application",
                        "description": "Consistent daily/weekly practice sessions with real-world application",
                        "priority": "medium",
                        "estimated_hours": complexity.get("estimated_duration_weeks", 4) * 5,
                        "category": "execution",
                        "dependencies": ["Set up practice environment"],
                        "tags": ["practice", "execution"]
                    }
                ])
            
            # Business/Startup goals
            elif any(word in goal_lower for word in ["business", "startup", "company", "entrepreneur", "launch"]):
                tasks.extend([
                    {
                        "title": "Market research and validation",
                        "description": "Analyze target market, competition, and validate business idea",
                        "priority": "high",
                        "estimated_hours": 12,
                        "category": "research",
                        "dependencies": [],
                        "tags": ["market", "research", "validation"]
                    },
                    {
                        "title": "Business model development",
                        "description": "Create comprehensive business plan with revenue model and strategy",
                        "priority": "high",
                        "estimated_hours": 16,
                        "category": "planning",
                        "dependencies": ["Market research and validation"],
                        "tags": ["business-plan", "strategy"]
                    },
                    {
                        "title": "MVP development and testing",
                        "description": "Build minimum viable product and gather user feedback",
                        "priority": "high",
                        "estimated_hours": 40,
                        "category": "development",
                        "dependencies": ["Business model development"],
                        "tags": ["mvp", "development", "testing"]
                    },
                    {
                        "title": "Funding and legal setup",
                        "description": "Secure funding, register business, and handle legal requirements",
                        "priority": "medium",
                        "estimated_hours": 8,
                        "category": "legal",
                        "dependencies": ["MVP development and testing"],
                        "tags": ["funding", "legal"]
                    }
                ])
            
            # Health/Fitness goals
            elif any(word in goal_lower for word in ["fitness", "health", "exercise", "diet", "weight", "workout"]):
                tasks.extend([
                    {
                        "title": "Health assessment and goal setting",
                        "description": "Evaluate current fitness level and set specific, measurable goals",
                        "priority": "high",
                        "estimated_hours": 2,
                        "category": "assessment",
                        "dependencies": [],
                        "tags": ["health", "assessment"]
                    },
                    {
                        "title": "Create personalized fitness plan",
                        "description": "Design workout routine and nutrition plan tailored to goals",
                        "priority": "high",
                        "estimated_hours": 3,
                        "category": "planning",
                        "dependencies": ["Health assessment and goal setting"],
                        "tags": ["fitness", "planning"]
                    },
                    {
                        "title": "Set up tracking and accountability",
                        "description": "Implement progress tracking system and find accountability partner",
                        "priority": "medium",
                        "estimated_hours": 2,
                        "category": "setup",
                        "dependencies": ["Create personalized fitness plan"],
                        "tags": ["tracking", "accountability"]
                    },
                    {
                        "title": "Consistent execution and monitoring",
                        "description": "Follow fitness plan and regularly assess progress",
                        "priority": "medium",
                        "estimated_hours": complexity.get("estimated_duration_weeks", 4) * 3,
                        "category": "execution",
                        "dependencies": ["Set up tracking and accountability"],
                        "tags": ["execution", "monitoring"]
                    }
                ])
            
            # Creative goals
            elif any(word in goal_lower for word in ["create", "build", "design", "write", "paint", "art", "content"]):
                tasks.extend([
                    {
                        "title": "Creative research and inspiration",
                        "description": "Study similar works, gather inspiration, and understand techniques",
                        "priority": "high",
                        "estimated_hours": 4,
                        "category": "research",
                        "dependencies": [],
                        "tags": ["creative", "research", "inspiration"]
                    },
                    {
                        "title": "Develop creative concept and style",
                        "description": "Define unique approach, style, and creative direction",
                        "priority": "high",
                        "estimated_hours": 6,
                        "category": "planning",
                        "dependencies": ["Creative research and inspiration"],
                        "tags": ["concept", "style", "planning"]
                    },
                    {
                        "title": "Create initial prototypes or drafts",
                        "description": "Develop first versions and iterate based on feedback",
                        "priority": "medium",
                        "estimated_hours": 12,
                        "category": "creation",
                        "dependencies": ["Develop creative concept and style"],
                        "tags": ["prototype", "creation"]
                    },
                    {
                        "title": "Refine and finalize work",
                        "description": "Polish and complete the creative project",
                        "priority": "medium",
                        "estimated_hours": 8,
                        "category": "refinement",
                        "dependencies": ["Create initial prototypes or drafts"],
                        "tags": ["refinement", "finalization"]
                    }
                ])
            
            # Generic execution and monitoring tasks
            tasks.extend([
                {
                    "title": "Set up progress tracking system",
                    "description": "Create dashboard or system to monitor progress and milestones",
                    "priority": "medium",
                    "estimated_hours": 2,
                    "category": "setup",
                    "dependencies": [],
                    "tags": ["tracking", "setup"]
                },
                {
                    "title": "Regular progress reviews and adjustments",
                    "description": "Weekly/monthly assessments and plan modifications as needed",
                    "priority": "medium",
                    "estimated_hours": complexity.get("estimated_duration_weeks", 4) * 1,
                    "category": "monitoring",
                    "dependencies": ["Set up progress tracking system"],
                    "tags": ["review", "adjustment"]
                }
            ])
            
            return tasks
        
        @Tool(
            name="create_execution_timeline",
            description="Create a realistic timeline for task execution"
        )
        def create_execution_timeline(tasks: List[Dict[str, Any]], timeframe: str) -> Dict[str, Any]:
            """Create execution timeline with scheduling"""
            
            # Parse timeframe
            timeframe_days = 30  # default
            if "week" in timeframe.lower():
                timeframe_days = int(timeframe.split()[0]) * 7 if timeframe.split()[0].isdigit() else 7
            elif "month" in timeframe.lower():
                timeframe_days = int(timeframe.split()[0]) * 30 if timeframe.split()[0].isdigit() else 30
            elif "year" in timeframe.lower():
                timeframe_days = int(timeframe.split()[0]) * 365 if timeframe.split()[0].isdigit() else 365
            
            # Calculate timeline
            total_hours = sum(task.get("estimated_hours", 1) for task in tasks)
            hours_per_week = min(20, total_hours / (timeframe_days / 7))  # Max 20 hours per week
            
            timeline = {
                "total_duration_days": timeframe_days,
                "total_estimated_hours": total_hours,
                "hours_per_week": hours_per_week,
                "weekly_schedule": [],
                "milestones": []
            }
            
            # Create weekly breakdown
            current_date = datetime.now()
            for week in range(int(timeframe_days / 7)):
                week_start = current_date + timedelta(weeks=week)
                week_tasks = tasks[week:week+2] if week < len(tasks) else []
                
                timeline["weekly_schedule"].append({
                    "week": week + 1,
                    "start_date": week_start.isoformat(),
                    "tasks": [task["title"] for task in week_tasks],
                    "focus_area": week_tasks[0]["category"] if week_tasks else "review"
                })
            
            # Add milestones
            milestone_intervals = max(1, int(timeframe_days / 30))  # Monthly milestones
            for i in range(0, timeframe_days, milestone_intervals):
                milestone_date = current_date + timedelta(days=i)
                timeline["milestones"].append({
                    "date": milestone_date.isoformat(),
                    "title": f"Milestone {i//milestone_intervals + 1}",
                    "description": "Review progress and adjust plan"
                })
            
            return timeline
        
        # Register tools with the tool registry
        self.tool_registry.register_tool(analyze_goal_complexity)
        self.tool_registry.register_tool(generate_task_breakdown)
        self.tool_registry.register_tool(create_execution_timeline)
    
    async def process_goal(self, goal: str, timeframe: str, user_context: Optional[Dict] = None) -> Dict[str, Any]:
        """Process a user's goal using Portia's agentic workflow or fallback"""
        
        print(f"[DEBUG] Processing goal: {goal}", file=sys.stderr)
        print(f"[DEBUG] Timeframe: {timeframe}", file=sys.stderr)
        print(f"[DEBUG] User ID: {self.user_id}", file=sys.stderr)
        print(f"[DEBUG] Portia available: {PORTIA_AVAILABLE}", file=sys.stderr)
        
        # Validate inputs
        if not goal or not timeframe:
            raise ValueError("Goal and timeframe are required")
        
        # Create user context if not provided
        if not user_context:
            user_context = {
                "user_id": self.user_id,
                "preferences": {
                    "working_hours_per_week": 20,
                    "preferred_working_days": ["monday", "tuesday", "wednesday", "thursday", "friday"],
                    "timezone": "UTC"
                }
            }
        
        if PORTIA_AVAILABLE and self.portia:
            try:
                return await self._process_with_portia(goal, timeframe, user_context)
            except Exception as e:
                print(f"[DEBUG] Portia processing failed: {e}", file=sys.stderr)
                print(f"[DEBUG] Falling back to local analysis", file=sys.stderr)
                return self._fallback_goal_analysis(goal, timeframe)
        else:
            print(f"[DEBUG] Using fallback analysis (Portia not available)", file=sys.stderr)
            return self._fallback_goal_analysis(goal, timeframe)
    
    async def _process_with_portia(self, goal: str, timeframe: str, user_context: Optional[Dict] = None) -> Dict[str, Any]:
        """Process goal using Portia SDK with enhanced user attribution and error handling"""
        
        # Create EndUser for attribution if cloud logging is enabled and EndUser is available
        end_user = None
        if self.enable_cloud_logging and ENDUSER_AVAILABLE and EndUser is not None:
            try:
                end_user = EndUser(
                    user_id=self.user_id,
                    metadata={
                        "plan": "dream-to-task",
                        "goal_type": self._categorize_goal(goal),
                        "timeframe": timeframe
                    }
                )
                print(f"[DEBUG] Created EndUser for attribution: {self.user_id}", file=sys.stderr)
            except Exception as e:
                print(f"[DEBUG] Failed to create EndUser: {e}", file=sys.stderr)
        elif self.enable_cloud_logging and not ENDUSER_AVAILABLE:
            print(f"[DEBUG] EndUser not available, skipping user attribution", file=sys.stderr)
        
        # Create a comprehensive prompt for goal processing
        prompt = f"""
        I need help turning my dream/goal into an actionable plan. Here are the details:
        
        Goal: {goal}
        Timeframe: {timeframe}
        User Context: {json.dumps(user_context or {}, indent=2)}
        
        Please help me by:
        1. Analyzing the complexity and feasibility of this goal using the analyze_goal_complexity tool
        2. Breaking it down into specific, actionable tasks with priorities using the generate_task_breakdown tool
        3. Creating a realistic execution timeline with milestones using the create_execution_timeline tool
        4. Providing success tips and potential obstacles to watch out for
        
        Use the available tools to provide a comprehensive analysis and action plan.
        Be specific and actionable in your recommendations.
        """
        
        try:
            # Generate plan using Portia
            print(f"[DEBUG] Generating plan with Portia...", file=sys.stderr)
            plan = await self.portia.generate_plan(prompt)
            print(f"[DEBUG] Plan generated successfully", file=sys.stderr)
            
            # Execute the plan
            print(f"[DEBUG] Executing plan...", file=sys.stderr)
            plan_run = await self.portia.run_plan(plan)
            print(f"[DEBUG] Plan execution completed", file=sys.stderr)
            
            # Extract results from plan run
            result = {
                "success": True,
                "plan_id": plan.id if hasattr(plan, 'id') else None,
                "run_id": plan_run.id if hasattr(plan_run, 'id') else None,
                "user_id": self.user_id,
                "analysis": self._extract_analysis_from_run(plan_run),
                "tasks": self._extract_tasks_from_run(plan_run),
                "timeline": self._extract_timeline_from_run(plan_run),
                "success_tips": self._generate_success_tips(goal, timeframe),
                "potential_obstacles": self._identify_obstacles(goal),
                "processed_at": datetime.now().isoformat()
            }
            
            print(f"[DEBUG] Portia processing completed successfully", file=sys.stderr)
            return result
            
        except Exception as e:
            print(f"[DEBUG] Error during Portia processing: {e}", file=sys.stderr)
            raise e
    
    def _extract_analysis_from_run(self, plan_run: Any) -> Dict[str, Any]:
        """Extract goal analysis from plan run results"""
        # This would extract actual results from the plan run
        # For now, providing a structured fallback
        return {
            "complexity_level": "intermediate",
            "feasibility_score": 0.8,
            "key_challenges": ["time management", "skill development", "consistency"],
            "required_resources": ["time", "learning materials", "practice environment"]
        }
    
    def _extract_tasks_from_run(self, plan_run: Any) -> List[Dict[str, Any]]:
        """Extract task breakdown from plan run results"""
        # This would extract actual task results from the plan run
        return []
    
    def _extract_timeline_from_run(self, plan_run: Any) -> Dict[str, Any]:
        """Extract timeline from plan run results"""
        # This would extract actual timeline from the plan run
        return {}
    
    def _generate_success_tips(self, goal: str, timeframe: str) -> List[str]:
        """Generate success tips based on goal and timeframe"""
        tips = [
            "Break large tasks into smaller, manageable chunks",
            "Set up regular progress check-ins and reviews",
            "Celebrate small wins along the way",
            "Build accountability through sharing progress with others",
            "Prepare for setbacks and have contingency plans"
        ]
        
        if "learn" in goal.lower():
            tips.extend([
                "Practice consistently, even if just for 15 minutes daily",
                "Apply new knowledge immediately to reinforce learning",
                "Join communities or find study partners"
            ])
        
        return tips
    
    def _identify_obstacles(self, goal: str) -> List[Dict[str, str]]:
        """Identify potential obstacles and mitigation strategies"""
        obstacles = [
            {
                "obstacle": "Lack of motivation over time",
                "mitigation": "Set up reward systems and track visible progress"
            },
            {
                "obstacle": "Time constraints",
                "mitigation": "Schedule dedicated time blocks and protect them"
            },
            {
                "obstacle": "Skill gaps",
                "mitigation": "Identify learning resources early and allocate time for skill building"
            }
        ]
        
        return obstacles
    
    def _fallback_goal_analysis(self, goal: str, timeframe: str) -> Dict[str, Any]:
        """Provide comprehensive fallback analysis when Portia processing fails"""
        print("[DEBUG] Using fallback goal analysis", file=sys.stderr)
        
        complexity_level = "intermediate"
        if any(word in goal.lower() for word in ["learn", "master", "expert", "advanced"]):
            complexity_level = "advanced"
        elif any(word in goal.lower() for word in ["simple", "basic", "easy", "quick"]):
            complexity_level = "beginner"
        
        # Generate tasks based on goal content
        tasks = []
        
        # Research phase tasks
        tasks.append({
            "title": "Research and planning",
            "description": f"Research requirements and create detailed plan for: {goal}",
            "priority": "high",
            "category": "research",
            "estimated_hours": 4
        })
        
        # Skill-based goals
        if any(word in goal.lower() for word in ["learn", "skill", "study", "course"]):
            tasks.extend([
                {
                    "title": "Find learning resources",
                    "description": "Identify courses, books, tutorials, and mentors",
                    "priority": "high",
                    "category": "research",
                    "estimated_hours": 3
                },
                {
                    "title": "Create study schedule",
                    "description": "Plan daily/weekly learning sessions",
                    "priority": "high",
                    "category": "planning",
                    "estimated_hours": 2
                },
                {
                    "title": "Practice regularly",
                    "description": "Consistent practice and application of new skills",
                    "priority": "medium",
                    "category": "execution",
                    "estimated_hours": 20
                }
            ])
        
        # Business/project goals
        if any(word in goal.lower() for word in ["business", "startup", "project", "build", "create"]):
            tasks.extend([
                {
                    "title": "Market analysis",
                    "description": "Analyze target market and competition",
                    "priority": "high",
                    "category": "research",
                    "estimated_hours": 6
                },
                {
                    "title": "Create prototype/MVP",
                    "description": "Build minimum viable version",
                    "priority": "medium",
                    "category": "execution",
                    "estimated_hours": 15
                },
                {
                    "title": "Test and iterate",
                    "description": "Get feedback and improve",
                    "priority": "medium",
                    "category": "testing",
                    "estimated_hours": 8
                }
            ])
        
        # Health/fitness goals
        if any(word in goal.lower() for word in ["fitness", "health", "exercise", "diet", "weight"]):
            tasks.extend([
                {
                    "title": "Assess current state",
                    "description": "Evaluate current fitness/health level",
                    "priority": "high",
                    "category": "assessment",
                    "estimated_hours": 2
                },
                {
                    "title": "Create workout/diet plan",
                    "description": "Design sustainable routine",
                    "priority": "high",
                    "category": "planning",
                    "estimated_hours": 3
                },
                {
                    "title": "Track progress",
                    "description": "Monitor and adjust plan regularly",
                    "priority": "medium",
                    "category": "monitoring",
                    "estimated_hours": 1
                }
            ])
        
        # Add generic execution tasks
        tasks.extend([
            {
                "title": "Set up tracking system",
                "description": "Create system to monitor progress and milestones",
                "priority": "medium",
                "category": "planning",
                "estimated_hours": 2
            },
            {
                "title": "Regular review and adjustment",
                "description": "Weekly/monthly progress reviews and plan adjustments",
                "priority": "medium",
                "category": "monitoring",
                "estimated_hours": 4
            }
        ])
        
        # Calculate timeline
        total_hours = sum(task.get("estimated_hours", 1) for task in tasks)
        timeframe_days = self._parse_timeframe_to_days(timeframe)
        
        return {
            "success": True,
            "fallback": True,
            "analysis": {
                "complexity_level": complexity_level,
                "feasibility_score": 0.8 if complexity_level == "beginner" else 0.7 if complexity_level == "intermediate" else 0.6,
                "key_challenges": self._identify_challenges(goal),
                "required_resources": self._identify_resources(goal)
            },
            "tasks": tasks,
            "timeline": {
                "total_duration_days": timeframe_days,
                "total_estimated_hours": total_hours,
                "hours_per_week": min(20, total_hours / (timeframe_days / 7)),
                "milestones": self._generate_milestones(timeframe_days)
            },
            "success_tips": self._generate_success_tips(goal, timeframe),
            "potential_obstacles": self._identify_obstacles(goal)
        }
    
    def _parse_timeframe_to_days(self, timeframe: str) -> int:
        """Parse timeframe string to number of days"""
        timeframe_lower = timeframe.lower()
        if "week" in timeframe_lower:
            weeks = 1
            for word in timeframe_lower.split():
                if word.isdigit():
                    weeks = int(word)
                    break
            return weeks * 7
        elif "month" in timeframe_lower:
            months = 1
            for word in timeframe_lower.split():
                if word.isdigit():
                    months = int(word)
                    break
            return months * 30
        elif "year" in timeframe_lower:
            years = 1
            for word in timeframe_lower.split():
                if word.isdigit():
                    years = int(word)
                    break
            return years * 365
        else:
            return 30  # default to 1 month
    
    def _identify_challenges(self, goal: str) -> List[str]:
        """Identify key challenges based on goal content"""
        challenges = ["time management", "consistency", "motivation"]
        
        if any(word in goal.lower() for word in ["learn", "skill"]):
            challenges.extend(["learning curve", "practice time"])
        if any(word in goal.lower() for word in ["business", "startup"]):
            challenges.extend(["funding", "market competition", "team building"])
        if any(word in goal.lower() for word in ["fitness", "health"]):
            challenges.extend(["habit formation", "physical limitations"])
        
        return challenges[:5]  # limit to 5 challenges
    
    def _identify_resources(self, goal: str) -> List[str]:
        """Identify required resources based on goal content"""
        resources = ["time", "effort"]
        
        if any(word in goal.lower() for word in ["learn", "skill", "course"]):
            resources.extend(["learning materials", "practice environment"])
        if any(word in goal.lower() for word in ["business", "startup", "build"]):
            resources.extend(["funding", "tools/software", "team/network"])
        if any(word in goal.lower() for word in ["fitness", "health"]):
            resources.extend(["gym/equipment", "nutrition plan"])
        
        return list(set(resources))  # remove duplicates
    
    def _generate_milestones(self, timeframe_days: int) -> List[Dict[str, str]]:
        """Generate milestone schedule based on timeframe"""
        milestones = []
        milestone_interval = max(7, timeframe_days // 4)  # At least weekly, max 4 milestones
        
        for i in range(milestone_interval, timeframe_days + 1, milestone_interval):
            milestone_date = datetime.now() + timedelta(days=i)
            milestone_num = (i // milestone_interval)
            
            milestones.append({
                "date": milestone_date.isoformat(),
                "title": f"Milestone {milestone_num}",
                "description": f"Review progress and adjust plan (Day {i})"
            })
        
        return milestones
    
    def _categorize_goal(self, goal: str) -> str:
        """Categorize the goal type for better analysis"""
        goal_lower = goal.lower()
        
        if any(word in goal_lower for word in ["learn", "skill", "study", "master", "course"]):
            return "learning"
        elif any(word in goal_lower for word in ["business", "startup", "company", "entrepreneur"]):
            return "business"
        elif any(word in goal_lower for word in ["fitness", "health", "exercise", "diet", "weight"]):
            return "health"
        elif any(word in goal_lower for word in ["create", "build", "design", "write", "paint", "art"]):
            return "creative"
        elif any(word in goal_lower for word in ["travel", "visit", "explore"]):
            return "travel"
        elif any(word in goal_lower for word in ["save", "invest", "money", "financial"]):
            return "financial"
        else:
            return "general"

async def main():
    """Main function for command-line usage with enhanced error handling"""
    try:
        if len(sys.argv) < 3:
            print("Usage: python portia_agent.py <goal> <timeframe> [user_id] [enable_cloud_logging]")
            print("Example: python portia_agent.py 'Learn to play guitar' '3-months' 'user123' 'true'")
            sys.exit(1)
        
        goal = sys.argv[1]
        timeframe = sys.argv[2]
        user_id = sys.argv[3] if len(sys.argv) > 3 else "default-user"
        enable_cloud_logging = sys.argv[4].lower() == 'true' if len(sys.argv) > 4 else True
        
        print(f"[DEBUG] Starting goal processing", file=sys.stderr)
        print(f"[DEBUG] Goal: {goal}", file=sys.stderr)
        print(f"[DEBUG] Timeframe: {timeframe}", file=sys.stderr)
        print(f"[DEBUG] User ID: {user_id}", file=sys.stderr)
        print(f"[DEBUG] Cloud logging: {enable_cloud_logging}", file=sys.stderr)
        
        # Initialize agent with user context
        agent = DreamTaskAgent(user_id=user_id, enable_cloud_logging=enable_cloud_logging)
        
        # Process the goal
        result = await agent.process_goal(goal, timeframe)
        
        print(f"[DEBUG] Goal processing completed successfully", file=sys.stderr)
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        print(f"[DEBUG] Error in main: {e}", file=sys.stderr)
        error_result = {
            "success": False,
            "error": str(e),
            "fallback": True,
            "processed_at": datetime.now().isoformat()
        }
        print(json.dumps(error_result, indent=2))
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
