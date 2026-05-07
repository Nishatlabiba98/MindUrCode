package MindUrCode.repository;

// =====================================================================
// MethodRepo.java  –  JPA Repository for the Method entity
// =====================================================================
//
// WHAT IS A JPA REPOSITORY?
//   Spring Data JPA lets you define an interface that extends
//   JpaRepository<EntityType, IdType>. Spring automatically creates
//   the implementation at runtime — you never write SQL or JDBC code.
//
// WHAT IS JpaRepository?
//   It already gives you for free:
//     save(method)              – insert or update a row
//     findById(id)              – find one row by primary key
//     findAll()                 – get every row in the table
//     delete(method)            – remove a row
//     count()                   – how many rows exist
//   You only need to declare the EXTRA queries your app needs.
//
// NAMING RULES FOR CUSTOM QUERIES
//   Spring reads your method name and generates the SQL automatically.
//   Pattern:  findBy<FieldName>(<value>)
//   Examples:
//     findBySourceFileId(UUID id)  →  SELECT * FROM method WHERE source_file_id = ?
//     findByCodeHash(String hash)  →  SELECT * FROM method WHERE code_hash = ?
//
// =====================================================================

import MindUrCode.model.Method;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface Method extends JpaRepository<Method, UUID> {

    // Get every method that belongs to a specific source file
    List<Method> findBySourceFileId(UUID sourceFileId);

    // Look up a method by its content hash to detect duplicates
    Optional<Method> findByCodeHash(String codeHash);
}
