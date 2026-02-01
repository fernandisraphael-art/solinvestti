-- 1. Permite que usuários autenticados (como o admin) excluam clientes
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON clients;
CREATE POLICY "Enable delete for authenticated users"
ON clients
FOR DELETE
TO authenticated
USING (true);

-- 2. Garante permissões de leitura/escrita completas para o admin (Insert/Update)
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON clients;
CREATE POLICY "Enable all access for authenticated users"
ON clients
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. Confirma que o RLS está ativo
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- 4. Garante permissões básicas
GRANT ALL ON TABLE clients TO authenticated;
GRANT ALL ON TABLE clients TO service_role;
