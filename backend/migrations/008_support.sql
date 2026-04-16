-- Tickets
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  subject VARCHAR(500) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'open',
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  category VARCHAR(100),
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tickets_tenant ON tickets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tickets_customer ON tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON tickets(assigned_to);

-- Ticket Messages
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id);

-- Knowledge Articles
CREATE TABLE IF NOT EXISTS knowledge_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  tags JSONB DEFAULT '[]',
  views INTEGER NOT NULL DEFAULT 0,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kb_articles_tenant ON knowledge_articles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_kb_articles_fts ON knowledge_articles USING GIN(to_tsvector('english', title || ' ' || content));
