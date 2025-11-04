import { Router } from 'express';
const router = Router();

router.get('/', (req, res) => {
  res.json({ status: 'OK', ts: new Date().toISOString() });
});

export default router;
