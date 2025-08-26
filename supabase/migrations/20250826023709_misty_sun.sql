/*
  # 賢者の精算システム - コアテーブル作成

  1. New Tables
    - `profiles` - ユーザープロフィール情報
      - `id` (uuid, primary key, auth.users参照)
      - `email` (text, unique)
      - `name` (text)
      - `company` (text)
      - `position` (text)
      - `phone` (text)
      - `department` (text)
      - `role` (text, デフォルト: 'user')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `business_trip_applications` - 出張申請
      - `id` (uuid, primary key)
      - `user_id` (uuid, profiles参照)
      - `title` (text)
      - `purpose` (text)
      - `start_date` (date)
      - `end_date` (date)
      - `destination` (text)
      - `estimated_amount` (integer)
      - `daily_allowance` (integer)
      - `transportation_cost` (integer)
      - `accommodation_cost` (integer)
      - `status` (text, デフォルト: 'draft')
      - `approver_id` (uuid, profiles参照)
      - `approved_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `expense_applications` - 経費申請
      - `id` (uuid, primary key)
      - `user_id` (uuid, profiles参照)
      - `title` (text)
      - `total_amount` (integer)
      - `status` (text, デフォルト: 'draft')
      - `approver_id` (uuid, profiles参照)
      - `approved_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `expense_items` - 経費項目
      - `id` (uuid, primary key)
      - `expense_application_id` (uuid, expense_applications参照)
      - `category` (text)
      - `date` (date)
      - `amount` (integer)
      - `description` (text)
      - `receipt_url` (text)
      - `created_at` (timestamp)

    - `travel_regulations` - 出張規程
      - `id` (uuid, primary key)
      - `company_name` (text)
      - `version` (text)
      - `status` (text, デフォルト: 'draft')
      - `company_info` (jsonb)
      - `articles` (jsonb)
      - `positions` (jsonb)
      - `settings` (jsonb)
      - `created_by` (uuid, profiles参照)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `documents` - 書類管理
      - `id` (uuid, primary key)
      - `user_id` (uuid, profiles参照)
      - `title` (text)
      - `type` (text)
      - `status` (text, デフォルト: 'draft')
      - `content` (jsonb)
      - `file_url` (text)
      - `file_size` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `notifications` - 通知履歴
      - `id` (uuid, primary key)
      - `user_id` (uuid, profiles参照)
      - `type` (text)
      - `title` (text)
      - `message` (text)
      - `category` (text)
      - `read` (boolean, デフォルト: false)
      - `created_at` (timestamp)

  2. Security
    - 全テーブルでRLSを有効化
    - ユーザーは自分のデータのみアクセス可能
    - 管理者は全データにアクセス可能
*/

-- プロフィールテーブル
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text,
  company text,
  position text,
  phone text,
  department text,
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 出張申請テーブル
CREATE TABLE IF NOT EXISTS business_trip_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  purpose text,
  start_date date,
  end_date date,
  destination text,
  estimated_amount integer DEFAULT 0,
  daily_allowance integer DEFAULT 0,
  transportation_cost integer DEFAULT 0,
  accommodation_cost integer DEFAULT 0,
  status text DEFAULT 'draft',
  approver_id uuid REFERENCES profiles(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 経費申請テーブル
CREATE TABLE IF NOT EXISTS expense_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  total_amount integer DEFAULT 0,
  status text DEFAULT 'draft',
  approver_id uuid REFERENCES profiles(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 経費項目テーブル
CREATE TABLE IF NOT EXISTS expense_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_application_id uuid REFERENCES expense_applications(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL,
  date date NOT NULL,
  amount integer NOT NULL,
  description text,
  receipt_url text,
  created_at timestamptz DEFAULT now()
);

-- 出張規程テーブル
CREATE TABLE IF NOT EXISTS travel_regulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  version text NOT NULL,
  status text DEFAULT 'draft',
  company_info jsonb DEFAULT '{}',
  articles jsonb DEFAULT '{}',
  positions jsonb DEFAULT '[]',
  settings jsonb DEFAULT '{}',
  created_by uuid REFERENCES profiles(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 書類管理テーブル
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  type text NOT NULL,
  status text DEFAULT 'draft',
  content jsonb DEFAULT '{}',
  file_url text,
  file_size text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 通知履歴テーブル
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text,
  category text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- RLS有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_trip_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_regulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- プロフィールポリシー
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 出張申請ポリシー
CREATE POLICY "Users can read own business trip applications"
  ON business_trip_applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = approver_id);

CREATE POLICY "Users can insert own business trip applications"
  ON business_trip_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own business trip applications"
  ON business_trip_applications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = approver_id);

-- 経費申請ポリシー
CREATE POLICY "Users can read own expense applications"
  ON expense_applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = approver_id);

CREATE POLICY "Users can insert own expense applications"
  ON expense_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expense applications"
  ON expense_applications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = approver_id);

-- 経費項目ポリシー
CREATE POLICY "Users can read expense items through applications"
  ON expense_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM expense_applications ea
      WHERE ea.id = expense_application_id
      AND (ea.user_id = auth.uid() OR ea.approver_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert expense items for own applications"
  ON expense_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM expense_applications ea
      WHERE ea.id = expense_application_id
      AND ea.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update expense items for own applications"
  ON expense_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM expense_applications ea
      WHERE ea.id = expense_application_id
      AND ea.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete expense items for own applications"
  ON expense_items
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM expense_applications ea
      WHERE ea.id = expense_application_id
      AND ea.user_id = auth.uid()
    )
  );

-- 出張規程ポリシー
CREATE POLICY "Users can read travel regulations"
  ON travel_regulations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert travel regulations"
  ON travel_regulations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own travel regulations"
  ON travel_regulations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- 書類管理ポリシー
CREATE POLICY "Users can read own documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON documents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 通知ポリシー
CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 管理者ポリシー（全データアクセス）
CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can read all business trip applications"
  ON business_trip_applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can read all expense applications"
  ON expense_applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_business_trip_applications_user_id ON business_trip_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_business_trip_applications_status ON business_trip_applications(status);
CREATE INDEX IF NOT EXISTS idx_expense_applications_user_id ON expense_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_expense_applications_status ON expense_applications(status);
CREATE INDEX IF NOT EXISTS idx_expense_items_application_id ON expense_items(expense_application_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);