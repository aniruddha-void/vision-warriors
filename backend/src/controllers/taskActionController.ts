import { Response } from 'express';
import { TaskModel, ActionModel, TemplateModel } from '../models/Campaigns.js';
import { AuditLogModel } from '../models/LogsAndSettings.js';
import { AuthRequest, getTenantShopId } from '../middleware/auth.js';

// --- Tasks ---
export async function getTasks(req: AuthRequest, res: Response): Promise<void> {
  try {
    const role = req.user?.role || 'owner';
    if (role === 'auditor') {
      res.status(403).json({ success: false, message: 'Forbidden: auditor cannot access daily operational tasks' });
      return;
    }

    const shopId = getTenantShopId(req);
    const tasks = await TaskModel.find({ shopId }).sort({ createdAt: -1 });
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function toggleTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    const role = req.user?.role || 'owner';
    if (role === 'auditor') {
      res.status(403).json({ success: false, message: 'Forbidden: auditor has read-only access and cannot toggle tasks' });
      return;
    }

    const { id } = req.params;
    const shopId = getTenantShopId(req);
    const task = await TaskModel.findOne({ id, shopId });

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    task.completed = !task.completed;
    await task.save();

    await AuditLogModel.create({
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      shopId,
      timestamp: new Date().toISOString(),
      user: req.user ? `${req.user.name} (${req.user.role})` : 'Operations Team',
      role: req.user?.role || 'staff',
      action: `Task status changed: ${task.title}`,
      details: `Task toggled to ${task.completed ? 'COMPLETED' : 'PENDING'}.`,
    });

    res.json({ success: true, task });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// --- Actions ---
export async function getActions(req: AuthRequest, res: Response): Promise<void> {
  try {
    const role = req.user?.role || 'owner';
    if (role === 'staff' || role === 'auditor') {
      res.status(403).json({ success: false, message: `Forbidden: role '${role}' cannot access strategic next-best-actions` });
      return;
    }

    const shopId = getTenantShopId(req);
    const actions = await ActionModel.find({ shopId }).sort({ confidence: -1 });
    res.json({ success: true, count: actions.length, data: actions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function completeAction(req: AuthRequest, res: Response): Promise<void> {
  try {
    const role = req.user?.role || 'owner';
    if (role !== 'owner' && role !== 'manager') {
      res.status(403).json({ success: false, message: `Forbidden: role '${role}' cannot mark strategic actions as completed` });
      return;
    }

    const { id } = req.params;
    const shopId = getTenantShopId(req);
    const action = await ActionModel.findOne({ id, shopId });

    if (!action) {
      res.status(404).json({ success: false, message: 'Action not found' });
      return;
    }

    action.isCompleted = true;
    await action.save();

    // Also mark associated task as complete if any in this shop
    await TaskModel.updateMany({ actionId: id, shopId }, { completed: true });

    await AuditLogModel.create({
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      shopId,
      timestamp: new Date().toISOString(),
      user: req.user ? `${req.user.name} (${req.user.role})` : 'Growth Strategist',
      role: req.user?.role || 'owner',
      action: `Action completed: ${action.title}`,
      details: `Next best action executed and flagged as completed.`,
    });

    res.json({ success: true, action });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// --- Templates ---
export async function getTemplates(req: AuthRequest, res: Response): Promise<void> {
  try {
    const role = req.user?.role || 'owner';
    if (role === 'auditor') {
      res.status(403).json({ success: false, message: 'Forbidden: auditor cannot access message templates' });
      return;
    }

    const shopId = getTenantShopId(req);
    const templates = await TemplateModel.find({ shopId });
    res.json({ success: true, count: templates.length, data: templates });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateTemplate(req: AuthRequest, res: Response): Promise<void> {
  try {
    const role = req.user?.role || 'owner';
    if (role === 'auditor') {
      res.status(403).json({ success: false, message: 'Forbidden: auditor cannot edit templates' });
      return;
    }

    const { id } = req.params;
    const { content } = req.body;
    const shopId = getTenantShopId(req);

    if (!content) {
      res.status(400).json({ success: false, message: 'Content is required' });
      return;
    }

    const template = await TemplateModel.findOne({ id, shopId });
    if (!template) {
      res.status(404).json({ success: false, message: 'Template not found' });
      return;
    }

    template.content = content;
    await template.save();

    await AuditLogModel.create({
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      shopId,
      timestamp: new Date().toISOString(),
      user: req.user ? `${req.user.name} (${req.user.role})` : 'Marketing Editor',
      role: req.user?.role || 'manager',
      action: `Template updated: ${template.title}`,
      details: `Updated channel content for ${template.channel.toUpperCase()}.`,
    });

    res.json({ success: true, template });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
