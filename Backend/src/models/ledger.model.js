const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
      required: true,
      index: true,
      immutable: true
    },

    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "transaction",
      required: true,
      index: true,
      immutable: true
    },

    type: {
      type: String,
      enum: ["CREDIT", "DEBIT"],
      required: true,
      immutable: true
    },

    amount: {                 // 👈 ADD THIS
      type: Number,
      required: true,
      min: 0,
      immutable: true
    }
  },
  { timestamps: true }
);


function preventLedgerModification() {
  throw new Error(
    "Ledger entries are immutable and cannot be modified or deleted"
  );
}

ledgerSchema.pre("findOneAndUpdate", preventLedgerModification);
ledgerSchema.pre("updateOne", preventLedgerModification);
ledgerSchema.pre("deleteOne", preventLedgerModification);
ledgerSchema.pre("remove", preventLedgerModification);
ledgerSchema.pre("deleteMany", preventLedgerModification);
ledgerSchema.pre("findOneAndDelete", preventLedgerModification);
ledgerSchema.pre("findOneAndReplace", preventLedgerModification);

const ledgerModel = mongoose.model("ledger", ledgerSchema);

module.exports = ledgerModel;
