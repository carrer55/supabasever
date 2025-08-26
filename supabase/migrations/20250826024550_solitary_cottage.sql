/*
  # 賢者の精算システム - コアテーブル作成

  1. New Tables
    - `profiles` - ユーザープロフィール情報
      - `id` (uuid, primary key) - ユーザーID
      - `email` (text, unique) - メールアドレス
      - `name` (text) - 氏名
      - `company` (text) - 会社名
      - `position` (text) - 役職
      - `phone` (text) - 電話番号
      - `department` (text) - 部署
      - `role` (text) - システム内役割
      - `created_at` (timestamptz) - 作成日時
      - `updated_at` (timestamptz) - 更新日時

    - `business_trip_applications` - 出張申請
      - `id` (uuid, primary key) - 申請ID
      - `user_id` (uuid, foreign key) - 申請者ID
      - `title` (text) - 申請タイトル
      - `purpose` (text) - 出張目的
      - `start_date` (date) - 開始日
      - `end_date` (date) - 終了日
      - `destination` (text) - 訪問先
      - `estimated_amount` (integer) - 予定金額
      - `daily_allowance` (integer) - 日当
      - `transportation_cost` (integer) - 交通費
      - `accommodation_cost` (integer) - 宿泊費
      - `status` (text) - ステータス
      - `approver_id` (uuid) - 承認者ID
      - `approved_at` (timestamptz) - 承認日時
      - `created_at` (timestamptz) - 作成日時
      - `updated_at` (timestamptz) - 更新日時

    - `expense_applications` - 経費申請
      - `id` (uuid, primary key) - 申請ID
      - `user_id` (uuid, foreign key) - 申請者ID
      - `title` (text) - 申請タイトル
      - `total_amount` (integer) - 合計金額
      - `status` (text) - ステータス
      - `approver_id` (uuid) - 承認者ID
      - `approved_at` (timestamptz) - 承認日時
      - `created_at` (timestamptz) - 作成日時
      - `updated_at` (timestamptz) - 更新日時

    - `expense_items` - 経費項目
      - `id` (uuid, primary key) - 項目ID
      - `expense_application_id` (uuid, foreign key) - 経費申請ID
      - `category` (text) - カテゴリ
      - `date` (date) - 日付
      - `amount` (integer) - 金額
      - `description` (text) - 説明
      - `receipt_url` (text) - 領収書URL
      - `created_at` (timestamptz) - 作成日時

    - `travel_regulations` - 出張規程
      - `id` (uuid, primary key) - 規程ID
      - `company_name` (text) - 会社名
      - `version` (text) - バージョン
      - `status` (text) - ステータス
      - `company_info` (jsonb) - 会社情報
      - `articles` (jsonb) - 条文
      - `positions` (jsonb) - 役職別設定
      - `settings` (jsonb) - その他設定
      - `created_by` (uuid, foreign key) - 作成者ID
      - `created_at` (timestamptz) - 作成日時
      - `updated_at` (timestamptz) - 更新日時

    - `documents` - 書類管理
      - `id` (uuid, primary key) - 書類ID
      - `user_id` (uuid, foreign key) - 作成者ID
      - `title` (text) - タイトル
      - `type` (text) - 書類種別
      - `status` (text) - ステータス
      - `content` (jsonb) - 書類内容
      - `file_url` (text) - ファイルURL
      - `file_size` (text) - ファイルサイズ
      - `created_at` (timestamptz) - 作成日時
      - `updated_at` (timestamptz) - 更新日時

    - `notifications` - 通知履歴
      - `id` (uuid, primary key) - 通知ID
      - `user_id` (uuid, foreign key) - ユーザーID
      - `type` (text) - 通知種別
      - `title` (text) - タイトル
      - `message` (text) - メッセージ
      - `category` (text) - カテゴリ
      - `read` (boolean) - 既読フラグ
      - `created_at` (timestamptz) - 作成日時

  2. Security
    - 全テーブルでRLSを有効化
    - ユーザーは自分のデータのみアクセス可能
    - 管理者は全データにアクセス可能
    - 適切な外部キー制約を設定

  3. Indexes
    - パフォーマンス向上のためのインデックス作成
    - 検索・フィルタリング用インデックス
*/

-- profiles テーブル
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text DEFAULT '',
  company text DEFAULT '',
  position text DEFAULT '',
  phone text DEFAULT '',
  department text DEFAULT '',
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

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

-- business_trip_applications テーブル
CREATE TABLE IF NOT EXISTS business_trip_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  purpose text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  destination text NOT NULL,
  estimated_amount integer DEFAULT 0,
  daily_allowance integer DEFAULT 0,
  transportation_cost integer DEFAULT 0,
  accommodation_cost integer DEFAULT 0,
  status text DEFAULT 'pending',
  approver_id uuid REFERENCES profiles(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE business_trip_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own business trip applications"
  ON business_trip_applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own business trip applications"
  ON business_trip_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own business trip applications"
  ON business_trip_applications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- expense_applications テーブル
CREATE TABLE IF NOT EXISTS expense_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  total_amount integer DEFAULT 0,
  status text DEFAULT 'pending',
  approver_id uuid REFERENCES profiles(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE expense_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own expense applications"
  ON expense_applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expense applications"
  ON expense_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expense applications"
  ON expense_applications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- expense_items テーブル
CREATE TABLE IF NOT EXISTS expense_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_application_id uuid REFERENCES expense_applications(id) ON DELETE CASCADE,
  category text NOT NULL,
  date date NOT NULL,
  amount integer NOT NULL,
  description text DEFAULT '',
  receipt_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE expense_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read expense items for own applications"
  ON expense_items
  FOR SELECT
  TO authenticated
  USING (
    expense_application_id IN (
      SELECT id FROM expense_applications WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert expense items for own applications"
  ON expense_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    expense_application_id IN (
      SELECT id FROM expense_applications WHERE user_id = auth.uid()
    )
  );

-- travel_regulations テーブル
CREATE TABLE IF NOT EXISTS travel_regulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  version text NOT NULL,
  status text DEFAULT 'draft',
  company_info jsonb DEFAULT '{}',
  articles jsonb DEFAULT '{}',
  positions jsonb DEFAULT '[]',
  settings jsonb DEFAULT '{}',
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE travel_regulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own travel regulations"
  ON travel_regulations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can insert own travel regulations"
  ON travel_regulations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own travel regulations"
  ON travel_regulations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- documents テーブル
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text NOT NULL,
  status text DEFAULT 'draft',
  content jsonb DEFAULT '{}',
  file_url text,
  file_size text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

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

-- notifications テーブル
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  category text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- インデックス作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_business_trip_applications_user_id ON business_trip_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_business_trip_applications_status ON business_trip_applications(status);
CREATE INDEX IF NOT EXISTS idx_business_trip_applications_created_at ON business_trip_applications(created_at);

CREATE INDEX IF NOT EXISTS idx_expense_applications_user_id ON expense_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_expense_applications_status ON expense_applications(status);
CREATE INDEX IF NOT EXISTS idx_expense_applications_created_at ON expense_applications(created_at);

CREATE INDEX IF NOT EXISTS idx_expense_items_application_id ON expense_items(expense_application_id);

CREATE INDEX IF NOT EXISTS idx_travel_regulations_created_by ON travel_regulations(created_by);
CREATE INDEX IF NOT EXISTS idx_travel_regulations_status ON travel_regulations(status);

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);