package com.align.compliance.repository;

import com.align.compliance.model.RegulatorySource;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RegulatorySourceRepository extends MongoRepository<RegulatorySource, String> {
}
