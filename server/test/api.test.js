import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { User, Category, Post, WeddingPlan } from '../src/models/index.js';
import * as authService from '../src/services/auth.service.js';
import * as postService from '../src/services/post.service.js';
import * as weddingPlanService from '../src/services/weddingPlan.service.js';

test('WedConnect Backend Architecture & Core Services Test Suite', async (t) => {
  await t.test('Database connection succeeds', async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wedconnect';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    assert.equal(mongoose.connection.readyState, 1);
  });

  await t.test('Categories are seeded and retrievable', async () => {
    const count = await Category.countDocuments();
    assert.ok(count >= 5, `Expected at least 5 categories, found ${count}`);
    const photography = await Category.findOne({ slug: 'photography-cinema' });
    assert.ok(photography, 'Photography category should exist');
    assert.equal(photography.name, 'Photography & Cinema');
  });

  await t.test('User authentication flow (login & compare password)', async () => {
    const userRes = await authService.login({
      email: 'couple@wedconnect.com',
      password: 'Password123!',
    });
    assert.ok(userRes.accessToken, 'Access token should be issued');
    assert.ok(userRes.refreshToken, 'Refresh token should be issued');
    assert.equal(userRes.user.email, 'couple@wedconnect.com');
    assert.equal(userRes.user.capabilities.isPlanner, true);
  });

  await t.test('Inspiration posts retrieval with pagination and like states', async () => {
    const feed = await postService.getForYouFeed({ page: 1, limit: 10 });
    assert.ok(feed.posts.length > 0, 'Feed should return posts');
    assert.ok(feed.total > 0, 'Total posts should be greater than zero');
    assert.ok(feed.posts[0].title, 'First post should have a title');
  });

  await t.test('Wedding Plan workspace aggregation & budget calculations', async () => {
    const couple = await User.findOne({ email: 'couple@wedconnect.com' });
    const plans = await weddingPlanService.getUserWeddingPlans(couple._id);
    assert.ok(plans.length > 0, 'Couple should have at least one wedding plan');

    const details = await weddingPlanService.getWeddingPlanDetails(plans[0]._id);
    assert.ok(details.stats, 'Workspace details should include calculated stats');
    assert.equal(details.stats.totalBudget, 45000);
    assert.ok(details.stats.totalTasks > 0, 'Tasks should be populated');
    assert.ok(details.stats.totalGuests > 0, 'Guests should be populated');
  });

  await mongoose.disconnect();
});
