#!/usr/bin/env node

/**
 * Automated Blog Publishing Cron Job
 * 
 * This script runs every hour to check if it's time to publish a new blog post.
 * It follows the schedule: 3 posts per week on Monday, Wednesday, Friday at 10:00 AM.
 * 
 * Usage:
 * - Add to your server's cron jobs: 0 * * * * node scripts/blog-cron.js
 * - Or run manually: node scripts/blog-cron.js
 */

const https = require('https');
const http = require('http');

// Configuration
const BLOG_SCHEDULE_URL = process.env.BLOG_SCHEDULE_URL || 'https://fypquiz.com/api/blog/schedule';
const LOG_ENABLED = process.env.LOG_ENABLED !== 'false';

function log(message) {
  if (LOG_ENABLED) {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function checkAndPublishBlog() {
  try {
    log('Starting blog publishing check...');
    
    // First, check the schedule status
    const scheduleResponse = await makeRequest(BLOG_SCHEDULE_URL);
    
    if (scheduleResponse.status !== 200) {
      log(`Error checking schedule: ${scheduleResponse.status}`);
      return;
    }
    
    const schedule = scheduleResponse.data.schedule;
    log(`Schedule check: shouldPublish=${schedule.shouldPublish}, nextPublishTime=${schedule.nextPublishTime}`);
    
    if (!schedule.shouldPublish) {
      log('Not time to publish yet');
      return;
    }
    
    // Time to publish! Trigger the blog generation
    log('Triggering blog post generation...');
    const publishResponse = await makeRequest(BLOG_SCHEDULE_URL, {
      method: 'POST'
    });
    
    if (publishResponse.status === 200) {
      log('Blog post published successfully!');
      log(`Next publish time: ${publishResponse.data.nextPublishTime}`);
    } else {
      log(`Error publishing blog post: ${publishResponse.status}`);
      if (publishResponse.data) {
        log(`Response: ${JSON.stringify(publishResponse.data)}`);
      }
    }
    
  } catch (error) {
    log(`Error in blog publishing cron: ${error.message}`);
  }
}

// Run the check
checkAndPublishBlog().then(() => {
  log('Blog publishing check completed');
  process.exit(0);
}).catch((error) => {
  log(`Fatal error: ${error.message}`);
  process.exit(1);
}); 