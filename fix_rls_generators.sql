-- 1. Permite que usuários autenticados (como o admin) insiram dados na tabela generators
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON generators;
CREATE POLICY "Enable insert for authenticated users"
ON generators
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 2. Garante permissões de leitura/escrita completas para o admin
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON generators;
CREATE POLICY "Enable all access for authenticated users"
ON generators
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. Confirma que o RLS está ativo mas com as permissões acima
ALTER TABLE generators ENABLE ROW LEVEL SECURITY;

-- 4. Garante permissões básicas (caso tenham sido revogadas)
GRANT ALL ON TABLE generators TO authenticated;
GRANT ALL ON TABLE generators TO service_role;
