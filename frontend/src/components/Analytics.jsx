import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, MessageSquare, Calendar, DollarSign } from 'lucide-react';

const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    totalConversations: 0,
    totalLeads: 0,
    totalAppointments: 0,
    conversionRate: 0,
    weeklyStats: [],
    topAgents: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      // This would fetch real analytics data
      // For now, we'll use mock data
      const mockData = {
        totalConversations: 1247,
        totalLeads: 89,
        totalAppointments: 23,
        conversionRate: 7.1,
        weeklyStats: [
          { day: 'Mon', conversations: 45, leads: 8, appointments: 2 },
          { day: 'Tue', conversations: 52, leads: 12, appointments: 3 },
          { day: 'Wed', conversations: 38, leads: 6, appointments: 1 },
          { day: 'Thu', conversations: 61, leads: 15, appointments: 4 },
          { day: 'Fri', conversations: 48, leads: 9, appointments: 2 },
          { day: 'Sat', conversations: 23, leads: 3, appointments: 1 },
          { day: 'Sun', conversations: 19, leads: 2, appointments: 0 }
        ],
        topAgents: [
          { name: 'Sales Agent', conversations: 456, leads: 34, conversionRate: 7.5 },
          { name: 'Support Agent', conversations: 389, leads: 28, conversionRate: 7.2 },
          { name: 'Marketing Agent', conversations: 402, leads: 27, conversionRate: 6.7 }
        ]
      };
      
      setAnalytics(mockData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      name: 'Total Conversations',
      value: analytics.totalConversations.toLocaleString(),
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Total Leads',
      value: analytics.totalLeads.toLocaleString(),
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Appointments',
      value: analytics.totalAppointments.toLocaleString(),
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      name: 'Conversion Rate',
      value: `${analytics.conversionRate}%`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Analytics</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="input-field"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Activity</h3>
          <div className="space-y-4">
            {analytics.weeklyStats.map((day, index) => (
              <div key={day.day} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 text-sm font-medium text-gray-600">{day.day}</div>
                  <div className="flex space-x-4 text-sm text-gray-500">
                    <span>{day.conversations} conv</span>
                    <span>{day.leads} leads</span>
                    <span>{day.appointments} apt</span>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-8 bg-blue-200 rounded"></div>
                  <div className="w-2 h-8 bg-green-200 rounded"></div>
                  <div className="w-2 h-8 bg-purple-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Agents */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Agents</h3>
          <div className="space-y-4">
            {analytics.topAgents.map((agent, index) => (
              <div key={agent.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{agent.name}</p>
                    <p className="text-sm text-gray-500">
                      {agent.conversations} conversations, {agent.leads} leads
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {agent.conversionRate}%
                  </p>
                  <p className="text-xs text-gray-500">conversion</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">New lead captured: John Doe</p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Appointment scheduled: Jane Smith</p>
                <p className="text-xs text-gray-500">15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Conversation completed: Mike Johnson</p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
