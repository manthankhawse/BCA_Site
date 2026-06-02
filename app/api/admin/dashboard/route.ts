import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getSessionFromRequest } from '@/lib/auth';
import { User } from '@/models/User';
import { Course } from '@/models/Course';
import { Assignment } from '@/models/Assignment';
import { Submission } from '@/models/Submission';
import { Post } from '@/models/Post';
import { Tournament } from '@/models/Tournament';

export async function GET(req: NextRequest) {
  try {
    const payload = await getSessionFromRequest(req);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await connectDB();

    const [
      totalStudents, totalCourses,
      totalPosts, totalTournaments,
      recentStudents, recentSubmissions, activeTournaments,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Course.countDocuments(),
      Post.countDocuments(),
      Tournament.countDocuments({ status: { $in: ['upcoming', 'registration', 'ongoing'] } }),
      User.find({ role: 'student' }).sort({ createdAt: -1 }).limit(5).select('name email rating createdAt'),
      Submission.find().sort({ createdAt: -1 }).limit(5)
        .populate('student', 'name').populate('assignment', 'title'),
      Tournament.find({ status: { $in: ['registration', 'ongoing'] } }).sort({ startDate: 1 }).limit(3),
    ]);

    // Enrollment trend (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const enrollmentTrend = await User.aggregate([
      { $match: { role: 'student', createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Assignment submission stats
    const submissionStats = await Submission.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          graded: { $sum: { $cond: [{ $ifNull: ['$grade', false] }, 1, 0] } },
        },
      },
    ]);

    // Top courses by enrollment
    const topCourses = await Course.aggregate([
      { $project: { title: 1, level: 1, count: { $size: '$enrolledStudents' } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    return NextResponse.json({
      stats: {
        totalStudents, totalCourses,
        totalPosts, totalTournaments,
        pendingSubmissions: (submissionStats[0]?.total || 0) - (submissionStats[0]?.graded || 0),
      },
      recentStudents,
      recentSubmissions,
      activeTournaments,
      enrollmentTrend,
      topCourses,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
